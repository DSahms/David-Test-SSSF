# User's Manual

This manual is for using the guided interface without typing on a keyboard.

## Start a job

1. Open the app and choose an existing workspace, or choose **New workspace** and select **Create My Workspace**. A custom name is optional.
2. Open **Discovery** and start a conversation.
3. Choose **Speak** and talk naturally, or choose **Paste** to bring in copied text. You can also choose an existing Markdown file.
4. The Discovery agent asks questions and updates the proposal as you go. Review the proposal and ask for changes before continuing.
5. Choose **Approve specification** only when the proposal is ready. Approval writes the exact reviewed proposal for the Python workflow to use.
6. Choose **Runs**, select a workflow, and launch it. Follow the visible phases and result.

The workflow cannot start from Discovery without explicit approval.

## Configure providers

Choose **Configuration** to adjust the specialist roster and AI provider settings. Copy a setting from your provider and use the **Paste from clipboard** button beside it. The intake assistant uses `LLM_BASE_URL`, `LLM_MODEL`, and, when needed, `LLM_API_KEY`. Save to store values in the workspace's gitignored `.env` file. Keys are masked after saving and must never be committed to source control.

## Bring in existing work

In Discovery, choose **Import .md** to select an existing Markdown/text specification, or drag a file into the proposal editor. In the conversation, use **Paste** to add copied text to your message. Supported imports are plain text and Markdown.

## Learn or get help

Use **Take the tour** to restart the guided walkthrough. Open the [Learner's Manual](../learners-manual/index.html) for lessons and walkthroughs.

## Current limitations

- Voice input requires a browser with the Web Speech API and permission to use the microphone. If voice input is unavailable, use the clipboard or a file picker.
- Discovery needs a reachable OpenAI-compatible chat-completions endpoint. Configure its URL, model, and optional key in **Configuration → AI provider setup** before starting a conversation.
- This is an early interface foundation. Desktop packaging and fully guided first-run provider setup are not implemented yet.
