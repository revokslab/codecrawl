<h3 align="center">
  <a name="readme-top"></a>
  <img
    src="https://raw.githubusercontent.com/revokslab/codecrawl/refs/heads/main/assets/logo.svg"
    height="200"
    width="200"
  >
</h3>

<div align="center">
   <h1>Codecrawl</h1>
</div>

Empower your AI apps with clean data from any repository. Featuring advanced codebase file-trees, semantic search, llms.txt and data extraction capabilities.


## What is Codecrawl?

[Codecrawl](https://crawl.revoks.dev?ref=github) is an API service that takes a repository URL, crawls it, and converts it into clean markdown or structured data, generate embeddings then store them in a vector database. We currently support only public codebases accessible on different codehosts like GitHub and Gitlab and give you clean data for each.

## How to use it?

We will provide an easy to use API with our hosted version. You can find the playground and documentation [here](https://crawl.revoks.dev/playground). You can also self host the backend if you'd like.

Check out the following resources to get started:
- [x] **API**: [Documentation](#cooming-soon)
- [x] **SDKs**: [Node](https://github.com/revokslab/codecrawl/blob/main/packages/sdk)
- [ ] Want an SDK or Integration? Let us know by opening an issue.

To run locally, refer to guide [here](https://github.com/revokslab/codecrawl/blob/main/CONTRIBUTING.md).

### API Key

To use the API, you need to sign up on [Codecrawl](https://api.revoks.dev) and get an API key.

### Features

- [**File Structure**](#filetree): Get repository file structure to feed to LLMs.
- [**LLMs.txt**](#llms.txt): Generate a Llms.txt to feed directly to any model
- [**Extract**](#indexing): Get structured data from single repo, multiple repo with the help AI.
- [**Search**](#search): Search repository content with semantic understanding
- [**Batch**](#batch-indexing-multiple-urls): Process multiple repositories simultaneously

### Powerful Capabilities
- **Multiple Output Formats**: Convert repository content to markdown, XML, plain text
- **Structured Data**: Extract metadata like file stats, token counts, and repository info
- **Advanced Search**: Find relevant files and content with semantic search
- **Repository Analytics**: Get insights on file sizes, token counts and top files
- **Scalable Processing**: Handle large codebases with configurable limits and batch operations
- **Clean Data**: Remove comments, empty lines and get compressed output as needed


### LLMs.txt

Generate a `llms.txt` file for a repository, optimized for feeding Language Model training. This endpoint initiates a job to create the `llms.txt` file and returns a job ID to track its progress.

```bash
curl -X POST https://api.revoks.dev/v1/llmstxt \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -d '{
    "url": "https://github.com/irere123/run-lang"
  }'
```

Returns a job ID to check the status of the `llms.txt` generation.

```json
{
  "success": true,
  "id": "123-456-789"
}
```

### Check LLMs.txt Job

Check the status and retrieve the content of a `llms.txt` generation job using the job ID.

```bash
curl -X GET https://api.revoks.dev/v1/llmstxt/123-456-789 \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_API_KEY'
```

Returns the status and data of the `llms.txt` generation job.

```json
{
  "success": true,
  "status": "completed",
  "data": {
    "llmstxt": "Content of the llms.txt file..."
  }
}
```

### Generate FileTree

Used to get the file tree of the whole repository using its URL. This returns plain tree for given repository. 
```bash cURL
curl -X POST https://api.revoks.dev/v1/tree \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer YOUR_API_KEY' \
    -d '{
      "url": "https://github.com/revoks123/run-lang", 
    }'
```

### Check FileTree Job

Check the status and retrieve the content of a `/v1/tree` generation job using the job ID.

```bash
curl -X GET https://api.revoks.dev/v1/tree/123-456-789 \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_API_KEY'
```

Returns the status and data of the `/v1/tree` generation job.

```json
{
  "success": true,
  "status": "completed",
  "data": {
    "tree": "Repository filetree..."
  }
}
```

## Contributing

We love contributions! Please read our [contributing guide](CONTRIBUTING.md) before submitting a pull request. If you'd like to self-host, refer to the [self-hosting guide](SELF_HOST.md).

_It is the sole responsibility of the end users to respect repositories' policies when indexing, searching and crawling with Codecrawl. Users are advised to adhere to the applicable privacy policies and Licenses prior to initiating any indexing activities. By default, Codecrawl respects the directives specified in the repository's .gitignore files when indexing. By utilizing Codecrawl, you expressly agree to comply with these conditions._

## Contributors

<a href="https://github.com/revokslab/codecrawl/graphs/contributors">
  <img alt="contributors" src="https://contrib.rocks/image?repo=Idee8/codecrawl"/>
</a>


## Credits 

Built with inspiration from [Firecrawl](https://github.com/mendableai/firecrawl). Special thanks to their contributors for pioneering web crawling.
