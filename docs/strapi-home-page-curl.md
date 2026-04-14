# Strapi Home Page — curl Reference

The Home Page is a **single type**. There is only one record — it is created/updated with `PUT`, never `POST`.

Set these two variables before running any command:

```bash
STRAPI_URL="http://localhost:1337"
TOKEN="your_api_token_here"
```

---

## Step 1 — Upload images (required before setting media fields)

Media fields (`topImage`, `topImageOverlay`, `bgTileImage`, `image` in masonry/feed) store a Strapi **file ID** (integer). You must upload each file first.

```bash
# Upload a single image — returns JSON with the file `id`
curl -X POST "$STRAPI_URL/api/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@/path/to/top-off.png" \
  -F "fileInfo={\"name\":\"top-off\",\"alternativeText\":\"Top image lights on\"}"
```

Response:
```json
[{ "id": 1, "url": "/uploads/top_off_abc123.png", ... }]
```

Upload all three shell images, then use their IDs in Step 2.

---

## Step 2 — PUT the full home page

```bash
curl -X PUT "$STRAPI_URL/api/home-page" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {

      "PageShell": {
        "topImage": 1,
        "topImageOverlay": 2,
        "bgTileImage": 3
      },

      "HomeHero": {
        "title": "Born on Brick, Built for Motion",
        "subtitle": "Streetwear from the underground up.",
        "buttons": [
          { "text": "Join the Community", "varient": "default", "href": "/community" },
          { "text": "View Collections",   "varient": "outline", "href": "/collections" }
        ]
      },

      "collection": {
        "sectionIntro": {
          "title": "Collections",
          "subtitle": "Explore our latest drops"
        },
        "product_collections": {
          "connect": ["<collection-documentId-1>", "<collection-documentId-2>"]
        }
      },

      "artistCollab": {
        "sectionIntro": [
          {
            "title": "Artist Collaborations",
            "subtitle": "Each collaboration tells a story through fabric, form, and color."
          }
        ],
        "artist_collaborations": {
          "connect": ["<artist-documentId-1>"]
        }
      },

      "masonry_images": {
        "image": 4,
        "alt": "Fragment of movement",
        "routeTo": "collections"
      },

      "category": {
        "sectionIntro": [
          {
            "title": "Shop by Category",
            "subtitle": "Find your style"
          }
        ],
        "product_categories": {
          "connect": ["<category-documentId-1>", "<category-documentId-2>"]
        }
      },

      "feedSection": [
        {
          "title": "Straight From the Feed.",
          "description": "The scene never sleeps. Tap in to what'\''s moving right now.",
          "postLink": "https://instagram.com/p/example",
          "media": 5,
          "button": {
            "text": "Pull up",
            "varient": "default",
            "href": "/feed"
          },
          "sectionIntro": []
        }
      ]

    }
  }'
```

---

## Step 3 — Verify the result

```bash
curl "$STRAPI_URL/api/home-page?populate=deep" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## Individual field updates

You can send only the fields you want to change — Strapi merges them into the existing record.

### Update hero text only

```bash
curl -X PUT "$STRAPI_URL/api/home-page" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "HomeHero": {
        "title": "New Headline",
        "subtitle": "New subtitle text.",
        "buttons": [
          { "text": "Shop Now", "varient": "default", "href": "/collections" }
        ]
      }
    }
  }'
```

### Update PageShell images only

```bash
curl -X PUT "$STRAPI_URL/api/home-page" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "PageShell": {
        "topImage": 7,
        "topImageOverlay": 8,
        "bgTileImage": 9
      }
    }
  }'
```

### Replace collection relations

```bash
curl -X PUT "$STRAPI_URL/api/home-page" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "collection": {
        "sectionIntro": { "title": "Collections", "subtitle": "New season" },
        "product_collections": {
          "set": ["<documentId-1>", "<documentId-2>", "<documentId-3>"]
        }
      }
    }
  }'
```

> Use `set` to replace all relations at once. Use `connect`/`disconnect` to add/remove individual ones.

### Add a feed section entry (repeatable component)

Repeatable components are replaced entirely on each PUT. Include all existing entries plus any new ones:

```bash
curl -X PUT "$STRAPI_URL/api/home-page" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "feedSection": [
        {
          "title": "Straight From the Feed.",
          "description": "The scene never sleeps.",
          "postLink": "https://instagram.com/p/abc",
          "media": 5,
          "button": { "text": "Pull up", "varient": "default", "href": "/feed" },
          "sectionIntro": []
        },
        {
          "title": "Behind the Drop.",
          "description": "Process shots from the studio.",
          "postLink": "https://instagram.com/p/xyz",
          "media": 6,
          "button": { "text": "See more", "varient": "outline", "href": "/behind" },
          "sectionIntro": []
        }
      ]
    }
  }'
```

---

## Field reference

| Field | Type | Notes |
|-------|------|-------|
| `PageShell.topImage` | media ID (int) | Lights-on image |
| `PageShell.topImageOverlay` | media ID (int) | Lights-off image |
| `PageShell.bgTileImage` | media ID (int) | Repeating background tile |
| `HomeHero.title` | string | Main headline |
| `HomeHero.subtitle` | text | Subheading |
| `HomeHero.buttons[].text` | string | Button label |
| `HomeHero.buttons[].varient` | string | `"default"` or `"outline"` |
| `HomeHero.buttons[].href` | string | Link URL |
| `collection.sectionIntro.title` | string | Section heading |
| `collection.sectionIntro.subtitle` | text | Section subheading |
| `collection.product_collections` | relation | `connect`/`disconnect`/`set` with documentIds |
| `artistCollab.sectionIntro[].title` | string | Section heading (repeatable) |
| `artistCollab.artist_collaborations` | relation | `connect`/`disconnect`/`set` with documentIds |
| `masonry_images.image` | media ID (int) | Required |
| `masonry_images.alt` | string | Alt text |
| `masonry_images.routeTo` | enum | `"collections"` or `"categories"` |
| `category.product_categories` | relation | `connect`/`disconnect`/`set` with documentIds |
| `feedSection[].title` | string | Feed section title |
| `feedSection[].description` | string | Feed section description |
| `feedSection[].postLink` | text | Instagram or external URL |
| `feedSection[].media` | media ID (int) | Feed image |
| `feedSection[].button.text` | string | CTA button label |
| `feedSection[].button.href` | string | CTA button URL |

---

## How to get documentIds for relations

```bash
# List product collections
curl "$STRAPI_URL/api/product-collections?fields=documentId,title,handle" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {documentId, title}'

# List product categories
curl "$STRAPI_URL/api/product-categories?fields=documentId,name,handle" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {documentId, name}'

# List artist collaborations
curl "$STRAPI_URL/api/artist-collaborations?fields=documentId,title,handle" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {documentId, title}'

# List uploaded files (to find media IDs)
curl "$STRAPI_URL/api/upload/files" \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | {id, name, url}'
```
