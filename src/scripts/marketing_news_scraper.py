import os
import json
import time
import warnings
import cloudscraper
from bs4 import BeautifulSoup

warnings.filterwarnings("ignore", category=UserWarning)

# Get the absolute path to the root directory
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
BASE_URL = "https://www.marketingtechnews.net"
URL = f"{BASE_URL}/news/"
OUTPUT_FILE = os.path.join(ROOT_DIR, "news.json")
CATEGORY = "Marketing"

# Cloudflare bypass configuration ✅
scraper = cloudscraper.create_scraper(
    browser={
        "browser": "chrome",
        "platform": "darwin",  # ✅ Correct for macOS
        "mobile": False
    }
)


def load_existing():
    if not os.path.exists(OUTPUT_FILE):
        return []
    try:
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []


def save_all(entries):
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)


def fetch_page(url):
    print(f"🔎 Fetching: {url}")
    resp = scraper.get(url)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def extract_article_content(url):
    soup = fetch_page(url)
    content_tag = (
        soup.select_one(".post-content")
        or soup.find("article")
        or soup.find("div", class_="content")
    )
    return content_tag.get_text(" ", strip=True) if content_tag else ""


def fetch_news_list():
    soup = fetch_page(URL)
    articles = soup.select("article")
    items = []

    for block in articles:
        title_tag = block.find("h3")
        if not title_tag:
            continue

        title = title_tag.get_text(strip=True)

        link_tag = title_tag.find("a")
        if not link_tag:
            continue

        link = link_tag.get("href")
        if link.startswith("/"):
            link = BASE_URL + link

        date_tag = block.find("time")
        date = date_tag.get("datetime") if date_tag else ""

        img_tag = block.find("img")
        thumbnail = img_tag.get("src") if img_tag else None

        print(f"📰 Extracting article → {title}")
        content = extract_article_content(link)

        items.append({
            "id": link,  # ✅ Link ensures global uniqueness
            "title": title,
            "content": content,
            "date": date,
            "thumbnail": thumbnail,
            "category": CATEGORY
        })

        time.sleep(1)  # ✅ Delay to avoid detection

    return items


def main():
    existing = load_existing()
    existing_ids = {x["id"] for x in existing}

    print(f"📦 Loaded {len(existing)} existing records")

    news_items = fetch_news_list()
    print(f"📥 Fetched {len(news_items)} items from site")

    new_items = [
        item for item in news_items
        if item["id"] not in existing_ids
    ]

    if new_items:
        save_all(existing + new_items)
        print(f"✅ Saved {len(new_items)} new articles!")
    else:
        print("✅ No new articles to add")


if __name__ == "__main__":
    main()
