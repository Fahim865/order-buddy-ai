# Order Buddy AI

Build a modern, full-stack AI Customer Support Agent web application with automated Tool Calling for order tracking.

### Core Features & Architecture:

1. UI & Chat Interface:

   - Clean, modern, responsive chat widget/dashboard using Tailwind CSS and React.

   - Real-time chat interface showing user messages and AI responses with smooth animations.

   - Display active status indicators (e.g., "AI Status: Idle", "Executing Tool: Check Order Status", "Searching Database...").

2. Tool Calling / Function Calling Setup:

   - System Prompt Instruction: Define the AI persona as a helpful E-commerce Customer Support Agent. Instruct the AI to respond politely to general greetings, but automatically trigger the `get_order_status` tool when a user provides or asks about an Order ID (e.g., ORD-1001, ORD-1002).

   - Tool Definition (`get_order_status`):

     - Function Name: `get_order_status`

     - Description: Retrieve order status, item details, estimated delivery date, and tracking number given an order_id.

     - Parameters: `order_id` (string, required).

3. Mock Backend / API Database Integration:

   - Create a mock database or API handler containing at least 4 sample orders:

     * ORD-1001: Status: "Shipped", Item: "Wireless Headphones", Carrier: "DHL", Delivery: "Tomorrow".

     * ORD-1002: Status: "Pending", Item: "Mechanical Keyboard", Payment: "Verified", Dispatch: "In 2 days".

     * ORD-1003: Status: "Delivered", Item: "Smart Watch", Delivered On: "Yesterday".

     * ORD-1004: Status: "Cancelled", Item: "Gaming Mouse", Reason: "Customer request".

   - If an order ID is not found, return an appropriate error payload so the AI can gracefully tell the user that the order was not found.

4. Execution Flow:

   - Step 1: User sends a message (e.g., "Hi, where is my order ORD-1001?").

   - Step 2: The LLM detects the order ID and generates a structured Tool Call (`get_order_status(order_id="ORD-1001")`).

   - Step 3: The application intercepts this tool call, queries the mock API/database, and retrieves the JSON result.

   - Step 4: The result is passed back to the LLM, which formats a friendly final response for the user.

5. Visual Feedback & Debug Panel:

   - Include a collapsible side panel or toggle titled "Developer Logs / Agent Thought Process".

   - Show live JSON logs of the conversation payload, raw tool call parameters, and tool execution outputs so I can inspect how tool calling works behind the scenes.

Please generate complete, working frontend and backend code with step-by-step setup instructions.Please build this project using Google Gemini API (gemini-1.5-flash or gemini-1.5-pro) for AI responses and Function Calling. 

- Use `@google/generative-ai` SDK on the backend/edge function.
- Create an environment variable input option for `GEMINI_API_KEY` (or set up `.env` file support).
- Pass the tool definitions in the `tools` parameter of the Gemini API call so Gemini can automatically trigger the function when an Order ID is detected.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4d7317af-21cb-4968-8996-661c270a9c6b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
