const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

// Replace Buffer-based code with browser-native functions
const base64Encode = (str) => {
  try {
    return window.btoa(unescape(encodeURIComponent(str || '')))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch {
    return '';
  }
};

const base64Decode = (base64Str) => {
  try {
    let str = base64Str?.toString() || '';
    // Convert URL-safe Base64 to regular Base64
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (str.length % 4) {
      str += '=';
    }
    return decodeURIComponent(escape(window.atob(str)));
  } catch (error) {
    console.error('Decoding error:', error);
    return '';
  }
};

export const evaluateCode = async ({ code, languageId, stdin }) => {
  const url = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true&fields=*';
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      language_id: languageId,
      source_code: base64Encode(code),
      stdin: base64Encode(stdin)
    })
  };

  try {
    const response = await fetch(url, options);
    const { token } = await response.json();
    
    return await getSubmission(token);
  } catch (error) {
    console.error(error);
  }

  const result = await getSubmission(token);
  console.log(result);

};

async function getSubmission(token) {

  const url = `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true&fields=*`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      stdout: base64Decode(data.stdout),
      stderr: base64Decode(data.stderr),
      message: base64Decode(data.message),
      status: data.status,
      time: data.time,
      memory: data.memory
    };
  } catch (error) {
    console.error(error);
  }
}

const checkStatus = async (token) => {
  const url = 'https://judge0-ce.p.rapidapi.com/statuses';
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    console.log(response);
    const data = await response.json();
    console.log(data);

    if (data.id <= 2) { // 1: In Queue, 2: Processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      return checkStatus(token);
    }

    return {
      stdout: base64Decode(data.stdout),
      stderr: base64Decode(data.stderr),
      message: base64Decode(data.message),
      status: data.status,
      time: data.time,
      memory: data.memory
    };
  } catch (error) {
    console.error(error);
  }
};
