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

  const tagsSelect = document.getElementById("tags");
  const selectedTags = Array.from(tagsSelect.selectedOptions).map(
    (option) => option.value
  );
  let tags = selectedTags.join(",");

  let url = "/api/snippets";
  let queryParams = [];
  if (language) {
    queryParams.push(`language=${encodeURIComponent(language)}`);
  }
  if (tags) {
    queryParams.push(`tags=${encodeURIComponent(tags)}`);
  }
  if (queryParams.length > 0) {
    url += "?" + queryParams.join("&");
  }

  loadSnippets(url);
});

window.addEventListener("DOMContentLoaded", () => {
  loadSnippets("/api/snippets");
});
