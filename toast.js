const token = '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';
const githubUser = 'Murgrip';
const repo = 'Account1';
const branch = 'main';

const headers = {
  'Authorization': `token ${token}`,
  'Content-Type': 'application/json'
};

function getUserPath(username) {
  return `users/${username}.json`;
}

// Check if a file exists
async function fileExists(path) {
  const url = `https://api.github.com/repos/${githubUser}/${repo}/contents/${path}`;
  const res = await fetch(url, { headers });
  return res.status === 200;
}

// Get file content and sha
async function getFile(path) {
  const url = `https://api.github.com/repos/${githubUser}/${repo}/contents/${path}`;
  const res = await fetch(url, { headers });
  const data = await res.json();
  return {
    content: JSON.parse(atob(data.content)),
    sha: data.sha
  };
}

// Update a file
async function updateFile(path, content, message, sha) {
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(content))));
  const url = `https://api.github.com/repos/${githubUser}/${repo}/contents/${path}`;
  const body = {
    message,
    content: encoded,
    branch,
    sha
  };
  const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
  return res.ok;
}

// 1. Add User
async function addUser(username, password) {
  const path = getUserPath(username);
  if (await fileExists(path)) return "Error: Username already exists";
  const content = [{ password }];
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(content))));
  const url = `https://api.github.com/repos/${githubUser}/${repo}/contents/${path}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `Add user ${username}`,
      content: encoded,
      branch
    })
  });
  return res.ok ? "User added successfully" : "Error adding user";
}

// 2. Remove User
async function removeUser(username, password) {
  const path = getUserPath(username);
  if (!(await fileExists(path))) return "Error: User not found";
  const { content, sha } = await getFile(path);
  if (content[0].password !== password) return "Error: Wrong password";
  const url = `https://api.github.com/repos/${githubUser}/${repo}/contents/${path}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({
      message: `Remove user ${username}`,
      sha,
      branch
    })
  });
  return res.ok ? "User removed" : "Error removing user";
}

// 3. Login User
async function loginUser(username, password) {
  const path = getUserPath(username);
  if (!(await fileExists(path))) return false;
  const { content } = await getFile(path);
  if (content[0].password === password) return content[0];
  return false;
}

// 4. Add Data
async function addData(username, key, value) {
  const path = getUserPath(username);
  const { content, sha } = await getFile(path);
  content[0][key] = value;
  return await updateFile(path, content, `Add ${key} to ${username}`, sha);
}

// 5. Remove Data
async function removeData(username, key) {
  const path = getUserPath(username);
  const { content, sha } = await getFile(path);
  delete content[0][key];
  return await updateFile(path, content, `Remove ${key} from ${username}`, sha);
}

// 6. Set Data (update value)
async function setData(username, key, value) {
  return await addData(username, key, value); // same logic
}
// 7. Get Data
function getData(username, key) {
  const path = getUserPath(username);
  return fileExists(path).then(exists => {
    if (!exists) return null;
    return getFile(path).then(({ content }) => {
      return content[0][key] ?? null;
    });
  });
}
getData("Rupam", "favColor").then(email => {
  console.log(email);
});
