import { Client, Databases, ID, Query } from "node-appwrite";
import Parser from "rss-parser";

const PROJECT_ID = process.env.PROJECT_ID;
const DB_ID = process.env.DB_ID;
const COLLECTION_ID_PROJECTS = process.env.COLLECTION_ID_PROJECTS;


export default async ({ req, res, log, err }) => {

    const client = new Client();
    client
        .setEndpoint('https://cloud.appwrite.io/v1')
        .setProject(PROJECT_ID);
    const db = new Databases(client);

    if (req.method === 'GET') {
        const allDocuments = await db.listDocuments(DB_ID, COLLECTION_ID_PROJECTS);

        return res.json({
            total: allDocuments.total,
        });
    }

    if (req.method === 'POST') {
        const parser = new Parser(
            Headers = {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
                'accept': 'text/html,application/xhtml+xml'
            });
        let feed = await parser.parseURL('https://www.reddit.com/r/htmx.rss');

        for (let item of feed.items) {
            const result = await db.listDocuments(DB_ID, COLLECTION_ID_PROJECTS, [
                Query.equal('url', item.link)
            ]);
            if (result.total === 0) {
                log(item.link);
                await db.createDocument(DB_ID, COLLECTION_ID_PROJECTS, ID.unique(), {
                    author: item.author,
                    content: item.contentSnippet,
                    contentHTML: item.content,
                    title: item.title,
                    pubDate: new Date(item.pubDate),
                    url: item.link,
                })
            }
        }
    }
    return res.empty()
}
