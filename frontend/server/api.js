const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

// Completely rewrite base64Encode to properly handle encoding for Judge0
const base64Encode = (str) => {
  if (str === null || str === undefined) {
    return "";
  }

  try {
    // First, encode the string as UTF-8
    const encoded = encodeURIComponent(str);
    // Then convert % sequences to their original byte values
    const binary = encoded.replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    );
    // Finally, encode as base64
    return btoa(binary);
  } catch (error) {
    console.error("Base64 encoding error:", error);
    return "";
  }
};

const base64Decode = (base64Str) => {
  if (!base64Str) {
    return "";
  }

  try {
    // First, decode the base64
    const binary = atob(base64Str);
    // Then, encode each byte as a % sequence
    const bytes = [];
    for (let i = 0; i < binary.length; i++) {
      bytes.push("%" + ("00" + binary.charCodeAt(i).toString(16)).slice(-2));
    }
    // Finally, decode the URI components
    return decodeURIComponent(bytes.join(""));
  } catch (error) {
    console.error("Base64 decoding error:", error);
    return "";
  }
};

export const evaluateCode = async ({ code, languageId, stdin }) => {
  console.log("Evaluating code with language ID:", languageId);
  console.log(
    "Code sample:",
    code ? code.substring(0, 50) + "..." : "No code provided"
  );

  const url =
    "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true&fields=*";
  const encodedCode = base64Encode(code || "");
  const encodedStdin = base64Encode(stdin || "");

  console.log("Encoded code sample:", encodedCode.substring(0, 30) + "...");

  const options = {
    method: "POST",
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language_id: languageId,
      source_code: encodedCode,
      stdin: encodedStdin,
    }),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!data.token) {
      console.error("No token received from Judge0:", data);
      throw new Error("Failed to get submission token");
    }

    console.log("Received token:", data.token);
    return await getSubmission(data.token);
  } catch (error) {
    console.error("Error during code evaluation:", error);
    throw error;
  }
};

async function getSubmission(token) {
  const url = `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true&fields=*`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
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
      memory: data.memory,
    };
  } catch (error) {
    console.error(error);
  }
}

const checkStatus = async (token) => {
  const url = "https://judge0-ce.p.rapidapi.com/statuses";
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    console.log(response);
    const data = await response.json();
    console.log(data);

    if (data.id <= 2) {
      // 1: In Queue, 2: Processing
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return checkStatus(token);
    }

    return {
      stdout: base64Decode(data.stdout),
      stderr: base64Decode(data.stderr),
      message: base64Decode(data.message),
      status: data.status,
      time: data.time,
      memory: data.memory,
    };
  } catch (error) {
    console.error(error);
  }
};
