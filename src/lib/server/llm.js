function getConfig() {
	let endpoint = process.env.ENDPOINT || 'https://api.openai.com/v1';
	let apiKey = process.env.API_KEY || '';
	let model = process.env.MODEL || 'gpt-5-nano';
	return { endpoint, apiKey, model };
}

export async function chatCompletion(messages, options = {}) {
	let config = getConfig();
	let url = config.endpoint.replace(/\/$/, '') + '/chat/completions';

	let body = {
		model: config.model,
		messages,
		reasoning_effort: 'low'
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
		prompt += `\n\nThe user already has these saved preferences. Do NOT repeat, rephrase, or include any of these in your generated snippets. Only produce snippets about NEW topics from this conversation:\n${titles}`;
	}

	if (existingTags.length > 0) {
		prompt += `\n\nWhen tagging snippets, add a tag for the conversation topic but also reuse these existing tags when they fit: ${existingTags.join(', ')}`;
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

const PROPOSE_SINGLE_PROMPT = `You are a creative meal suggestion assistant. Based on the user's preferences and desired tags, suggest exactly 1 meal idea.

Return your suggestion as a JSON object inside a code fence:

\`\`\`json
{"name": "Meal Name", "description": "Brief description", "tags": ["relevant", "tags"]}
\`\`\`

Be creative but practical. Suggest a meal that matches the preferences and is realistic to cook at home.`;

export async function proposeSingleMeal(preferences, activeTags, theme = '', avoidNames = []) {
	let prefsText = preferences.map((p) => `- ${p.text} (${p.tags.join(', ')})`).join('\n');
	let tagsText = activeTags.length > 0 ? `Focus on these tags: ${activeTags.join(', ')}` : '';
	let themeText = theme ? `Theme or idea: ${theme}` : '';
	let avoidText = avoidNames.length > 0 ? `Do NOT suggest any of these: ${avoidNames.join(', ')}` : '';

	let parts = ['My food preferences:', prefsText, tagsText, themeText, avoidText, 'Suggest 1 meal I might enjoy.'];
	let userMessage = parts.filter(Boolean).join('\n\n');

	let messages = [
		{ role: 'system', content: PROPOSE_SINGLE_PROMPT },
		{ role: 'user', content: userMessage }
	];

	let reply = await chatCompletion(messages);

	try {
		let parsed = extractJson(reply);
		if (Array.isArray(parsed)) {
			return parsed[0] || null;
		}
		return parsed;
	} catch {
		return null;
	}
}

const MEAL_DETAILS_PROMPT = `You are a helpful cooking assistant. Given a meal name and its tags, write a short description of the meal (2-3 sentences). Focus on what makes it appealing and any key ingredients or techniques.

Return only the description text, no JSON or formatting.`;

export async function generateMealDetails(name, tags) {
	let tagsText = tags.length > 0 ? ` (tags: ${tags.join(', ')})` : '';
	let userMessage = `Describe this meal: ${name}${tagsText}`;

	let messages = [
		{ role: 'system', content: MEAL_DETAILS_PROMPT },
		{ role: 'user', content: userMessage }
	];

	return await chatCompletion(messages);
}
