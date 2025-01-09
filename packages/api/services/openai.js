import { AzureOpenAI } from 'openai'
import { AzureKeyCredential } from '@azure/core-auth'

class OpenAIService {
  static async sendMessage(stream, text) {
    try {
      const client = new AzureOpenAI('https://mai-us-w.openai.azure.com/', new AzureKeyCredential(process.env.OPENAI_API_KEY))
      const deploymentId = 'gpt-4o'

      const messages = [
        { role: 'system', content: 'You are a helpful assistant. You will talk like a pirate. 用简体中文回答。每个步骤用单独的一行来写。' },
        { role: 'user', content: 'Can you help me?' },
        { role: 'assistant', content: 'Arrrr! Of course, me hearty! What can I do for ye?' },
        { role: 'user', content: "What's the best way to train a parrot?" }
      ]

      // console.log(`Messages: ${messages.map((m) => m.content).join('\n')}`)

      const events = await client.streamChatCompletions(deploymentId, messages, { maxTokens: 2000 })
      let str = ''
      for await (const event of events) {
        for (const choice of event.choices) {
          const delta = choice.delta?.content
          if (delta !== undefined) {
            // console.log(`data: ${delta}`)
            str += delta
            // stream.write(`data: ${delta.replace('\n', '\\x0A')}\n\n`)
            stream.write(delta)
          }
        }
      }
      // stream.write(`data: [DONE]\n\n`)
      stream.write('[DONE]')
      console.log(str)
    } catch (err) {
      stream.write('[DONE]')
      console.log(err)
    }
  }
}

export default OpenAIService
