import { createFileRoute } from "@tanstack/react-router";
import { getOrderStatus } from "@/lib/orders";

const SYSTEM_PROMPT = `You are Nova, a friendly and concise e-commerce Customer Support Agent.
- Greet politely and answer general questions conversationally.
- Whenever the user mentions, provides, or asks about an order ID (format like ORD-1001), you MUST call the get_order_status tool with that exact order_id. Never invent order details.
- If the tool reports the order was not found, apologise and ask the customer to re-check the ID.
- Keep answers short, warm, and formatted for chat. Mention tracking numbers and delivery dates when available.`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "get_order_status",
      description:
        "Retrieve order status, item details, estimated delivery date, and tracking number given an order_id.",
      parameters: {
        type: "object",
        properties: {
          order_id: {
            type: "string",
            description: "The customer order identifier, e.g. ORD-1001",
          },
        },
        required: ["order_id"],
        additionalProperties: false,
      },
    },
  },
];

type ChatMsg = { role: string; content: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "AI is not configured." }, { status: 500 });
        }

        let body: { messages?: ChatMsg[] };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }

        const history = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
        const messages: any[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...history
            .filter((m) => m && typeof m.content === "string")
            .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
        ];

        const logs: any[] = [];
        const callModel = async () => {
          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": apiKey,
            },
            body: JSON.stringify({
              model: "google/gemini-3.8-flash",
              messages,
              tools: TOOLS,
            }),
          });
          if (!res.ok) {
            const text = await res.text();
            return { ok: false as const, status: res.status, text };
          }
          return { ok: true as const, data: await res.json() };
        };

        for (let step = 0; step < 4; step++) {
          logs.push({ type: "request", step, payload: { model: "google/gemini-3.8-flash", messages, tools: ["get_order_status"] } });
          const result = await callModel();

          if (!result.ok) {
            const message =
              result.status === 429
                ? "Too many requests right now — please try again in a moment."
                : result.status === 402
                  ? "AI credits are exhausted for this workspace."
                  : "The AI service returned an error.";
            logs.push({ type: "error", status: result.status, body: result.text });
            return Response.json({ error: message, logs }, { status: result.status });
          }

          const choice = result.data?.choices?.[0];
          const msg = choice?.message ?? {};
          logs.push({ type: "model_response", step, message: msg });

          const toolCalls = msg.tool_calls ?? [];
          if (toolCalls.length === 0) {
            return Response.json({ reply: msg.content ?? "", logs });
          }

          messages.push(msg);
          for (const call of toolCalls) {
            let args: any = {};
            try {
              args = JSON.parse(call.function?.arguments || "{}");
            } catch {
              args = {};
            }
            logs.push({ type: "tool_call", name: call.function?.name, arguments: args });
            const output =
              call.function?.name === "get_order_status"
                ? getOrderStatus(args.order_id)
                : { success: false, error: "UNKNOWN_TOOL" };
            logs.push({ type: "tool_result", name: call.function?.name, output });
            messages.push({
              role: "tool",
              tool_call_id: call.id,
              content: JSON.stringify(output),
            });
          }
        }

        return Response.json({ reply: "I couldn't complete that request. Please try again.", logs });
      },
    },
  },
});
