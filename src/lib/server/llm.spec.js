import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let llm;

beforeEach(async () => {
	process.env.API_KEY = 'test-key';
	process.env.MODEL = 'test-model';
	process.env.ENDPOINT = 'https://api.example.com/v1';

	llm = await import('./llm.js?' + Date.now());
});

afterEach(() => {
	vi.restoreAllMocks();
	delete process.env.API_KEY;
	delete process.env.MODEL;
	delete process.env.ENDPOINT;
});

describe('chatCompletion', () => {
	it('sends correct headers and body', async () => {
		let capturedRequest = null;
		vi.spyOn(global, 'fetch').mockImplementation(async (url, options) => {
			capturedRequest = { url, options };
			return new Response(
				JSON.stringify({
					choices: [{ message: { content: 'Hello!' } }]
				})
			);
		});

		let messages = [{ role: 'user', content: 'Hi' }];
		await llm.chatCompletion(messages);

		expect(capturedRequest.url).toBe('https://api.example.com/v1/chat/completions');
		let headers = capturedRequest.options.headers;
		expect(headers['Authorization']).toBe('Bearer test-key');
		expect(headers['Content-Type']).toBe('application/json');

		let body = JSON.parse(capturedRequest.options.body);
		expect(body.model).toBe('test-model');
		expect(body.messages).toEqual(messages);
	});

	it('returns the message content', async () => {
		vi.spyOn(global, 'fetch').mockResolvedValue(
			new Response(
				JSON.stringify({
					choices: [{ message: { content: 'Test response' } }]
				})
			)
		);

		let result = await llm.chatCompletion([{ role: 'user', content: 'Hi' }]);
		expect(result).toBe('Test response');
	});

	it('throws on non-ok response', async () => {
		vi.spyOn(global, 'fetch').mockResolvedValue(new Response('Unauthorized', { status: 401 }));

		await expect(llm.chatCompletion([{ role: 'user', content: 'Hi' }])).rejects.toThrow(
			'LLM request failed'
		);
	});
});

describe('discoverPreference', () => {
	it('returns reply and done false when conversation is ongoing', async () => {
		vi.spyOn(global, 'fetch').mockResolvedValue(
			new Response(
				JSON.stringify({
					choices: [{ message: { content: 'What kinds of cuisine do you enjoy?' } }]
				})
			)
		);

		let result = await llm.discoverPreference([
			{ role: 'user', content: 'Help me discover my preferences' }
		]);
		expect(result.reply).toBe('What kinds of cuisine do you enjoy?');
		expect(result.done).toBe(false);
		expect(result.snippets).toBeNull();
	});

	it('detects done state and extracts single snippet as array', async () => {
		let responseWithSnippet =
			'Great! Based on our conversation, here is your preference:\n\n```json\n{"text": "I enjoy bold Mediterranean flavors", "tags": ["mediterranean", "bold"]}\n```';
		vi.spyOn(global, 'fetch').mockResolvedValue(
			new Response(
				JSON.stringify({
					choices: [{ message: { content: responseWithSnippet } }]
				})
			)
		);

		let result = await llm.discoverPreference([
			{ role: 'user', content: 'I think that covers it' }
		]);
		expect(result.done).toBe(true);
		expect(result.snippets).toHaveLength(1);
		expect(result.snippets[0].text).toBe('I enjoy bold Mediterranean flavors');
		expect(result.snippets[0].tags).toEqual(['mediterranean', 'bold']);
	});

	it('detects done state and extracts multiple snippets', async () => {
		let responseWithSnippets =
			'Here are your preferences:\n\n```json\n[{"text": "Kids prefer mild pasta dishes", "tags": ["kids", "mild"]}, {"text": "Adults enjoy spicy Thai curries", "tags": ["thai", "spicy"]}]\n```';
		vi.spyOn(global, 'fetch').mockResolvedValue(
			new Response(
				JSON.stringify({
					choices: [{ message: { content: responseWithSnippets } }]
				})
			)
		);

		let result = await llm.discoverPreference([
			{ role: 'user', content: 'I think that covers it' }
		]);
		expect(result.done).toBe(true);
		expect(result.snippets).toHaveLength(2);
		expect(result.snippets[0].text).toBe('Kids prefer mild pasta dishes');
		expect(result.snippets[1].text).toBe('Adults enjoy spicy Thai curries');
	});
});

describe('proposeMeals', () => {
	it('parses JSON array of meal proposals', async () => {
		let proposals = [
			{ name: 'Pasta', description: 'A classic', tags: ['italian'] },
			{ name: 'Tacos', description: 'Quick and easy', tags: ['mexican'] }
		];
		vi.spyOn(global, 'fetch').mockResolvedValue(
			new Response(
				JSON.stringify({
					choices: [
						{
							message: {
								content: '```json\n' + JSON.stringify(proposals) + '\n```'
							}
						}
					]
				})
			)
		);

		let result = await llm.proposeMeals(
			[{ text: 'I like spicy food', tags: ['spicy'] }],
			['italian']
		);
		expect(result).toHaveLength(2);
		expect(result[0].name).toBe('Pasta');
		expect(result[1].name).toBe('Tacos');
	});
});
