import { Client, Databases, ID, Query } from "node-appwrite";
import Parser from "rss-parser";

const PROJECT_ID = process.env.PROJECT_ID;
const DB_ID = process.env.DB_ID;
const COLLECTION_ID_PROJECTS = process.env.COLLECTION_ID_PROJECTS;

async function getPosts(parser, subreddit) {
    const feed = await parser.parseURL(subreddit);
    return feed.items
}

async function savePosts(db, posts) {
    for (let post of posts) {
        const result = await db.listDocuments(DB_ID, COLLECTION_ID_PROJECTS, [
            Query.equal('url', post.link)
        ]);
        if (result.total === 0) {
            log(post.link);
            await db.createDocument(DB_ID, COLLECTION_ID_PROJECTS, ID.unique(), {
                author: post.author,
                content: post.contentSnippet,
                contentHTML: post.content,
                title: post.title,
                pubDate: new Date(post.pubDate),
                url: post.link,
                subreddit: 'htmx',
            })
        }
    }
}

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

        const posts = await getPosts(parser, 'https://www.reddit.com/r/htmx.rss')
        await savePosts(db, posts);
    }
    return res.empty()
}
