async function loadSnippets(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch snippets");
    }
    const snippets = await response.json();
    const container = document.getElementById("snippets-container");

    if (Array.isArray(snippets) && snippets.length > 0) {
      let html =
        "<table border='1'><thead><tr><th>Title</th><th>Language</th><th>Tags</th><th>Code</th></tr></thead><tbody>";
      snippets.forEach((snip) => {
        html += `
          <tr>
            <td>${snip.title}</td>
            <td>${snip.language}</td>
            <td>${snip.tags.join(", ")}</td>
            <td><pre>${snip.code}</pre></td>
          </tr>
        `;
      });
      html += "</tbody></table>";
      container.innerHTML = html;
    } else {
      container.innerHTML = "<p>No snippets found.</p>";
    }
  } catch (error) {
    console.error(error);
  }
}

document.getElementById("filterForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const language = document.getElementById("language").value;
  const tags = document.getElementById("tags").value;

  let url = "/api/snippets";
  let query = [];
  if (language) query.push(`language=${encodeURIComponent(language)}`);
  if (tags) query.push(`tags=${encodeURIComponent(tags)}`);
  if (query.length) url += "?" + query.join("&");

  loadSnippets(url);
});

window.addEventListener("DOMContentLoaded", () => {
  loadSnippets("/api/snippets");
});
