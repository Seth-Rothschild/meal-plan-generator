function getConfig() {
	let endpoint = process.env.ENDPOINT || 'https://api.openai.com/v1';
	let apiKey = process.env.API_KEY || '';
	let model = process.env.MODEL || 'gpt-5-mini';
	return { endpoint, apiKey, model };
}

export async function chatCompletion(messages, options = {}) {
	let config = getConfig();
	let url = config.endpoint.replace(/\/$/, '') + '/chat/completions';

	let body = {
		model: config.model,
		messages
	};

	let response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.apiKey}`
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		let errorText = await response.text();
		throw new Error(`LLM request failed: ${response.status} ${errorText}`);
	}

	let result = await response.json();
	return result.choices[0].message.content;
}

function extractJson(text) {
	let fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (fenceMatch) {
		return JSON.parse(fenceMatch[1].trim());
	}
	return JSON.parse(text);
}

const DISCOVER_SYSTEM_PROMPT = `You are a friendly food preference discovery assistant. Your goal is to help the user understand and articulate their food preferences related to a topic of their choice through a short conversation (3-5 exchanges).

Ask thoughtful follow up questions that might reveal more about their preferences on this topic.

When you feel you have enough information (after 3-5 exchanges), produce preference snippets. If the conversation touched on multiple distinct sub-topics (for example, kid-friendly food vs adult tastes vs time constraints), produce a separate snippet for each one. Signal completion by including a JSON block in your response like this:

\`\`\`json
[
  {"text": "A concise preference about one sub-topic", "tags": ["relevant", "tags"]},
  {"text": "A concise preference about another sub-topic", "tags": ["other", "tags"]}
]
\`\`\`

Each snippet should stand on its own as a useful, specific preference. Do not combine unrelated sub-topics into a single snippet.

Keep the conversation warm and conversational. Ask one or two questions at a time, not a long list.`;

function buildDiscoverPrompt(existingPreferences, existingTags) {
	let prompt = DISCOVER_SYSTEM_PROMPT;

	if (existingPreferences.length > 0) {
		let titles = existingPreferences.map((p) => `- ${p.text}`).join('\n');
		prompt += `\n\nThe user already has these saved preferences. Avoid asking about topics they already cover:\n${titles}`;
	}

	if (existingTags.length > 0) {
		prompt += `\n\nWhen tagging snippets, reuse these existing tags when they fit: ${existingTags.join(', ')}`;
	}

	return prompt;
}

export async function discoverPreference(messages, { existingPreferences = [], existingTags = [] } = {}) {
	let systemPrompt = buildDiscoverPrompt(existingPreferences, existingTags);
	let fullMessages = [{ role: 'system', content: systemPrompt }, ...messages];

	let reply = await chatCompletion(fullMessages);

	let hasJson = reply.includes('```json');
	if (hasJson) {
		try {
			let parsed = extractJson(reply);
			let snippets = Array.isArray(parsed) ? parsed : [parsed];
			let cleanReply = reply.replace(/```(?:json)?\s*[\s\S]*?```/, '').trim();
			return { reply: cleanReply || reply, done: true, snippets };
		} catch {
			return { reply, done: false, snippets: null };
		}
	}

	return { reply, done: false, snippets: null };
}

const PROPOSE_SYSTEM_PROMPT = `You are a creative meal suggestion assistant. Based on the user's preferences and desired tags, suggest 3 meal ideas.

Return your suggestions as a JSON array inside a code fence:

\`\`\`json
[
  {"name": "Meal Name", "description": "Brief description", "tags": ["relevant", "tags"]},
  ...
]
\`\`\`

Be creative but practical. Suggest meals that match the preferences and are realistic to cook at home.`;

export async function proposeMeals(preferences, activeTags) {
	let prefsText = preferences.map((p) => `- ${p.text} (${p.tags.join(', ')})`).join('\n');
	let tagsText = activeTags.length > 0 ? `Focus on these tags: ${activeTags.join(', ')}` : '';

	let userMessage = `My food preferences:\n${prefsText}\n\n${tagsText}\n\nSuggest 3 meals I might enjoy.`;

	let messages = [
		{ role: 'system', content: PROPOSE_SYSTEM_PROMPT },
		{ role: 'user', content: userMessage }
	];

	let reply = await chatCompletion(messages);

	try {
		return extractJson(reply);
	} catch {
		return [];
	}
}
