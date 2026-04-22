#!/bin/bash
BASE_URL="http://localhost:3000"

echo "🚀 Starting E2E API Tests..."

# 1. Upload test1.pdf
echo "📤 Uploading test1.pdf..."
UPLOAD1=$(curl -s -F "files=@test-assets/test1.pdf" $BASE_URL/api/upload)
ID1=$(echo $UPLOAD1 | grep -oP '"id":"\K[^"]+')
echo "✅ Upload 1 Success. ID: $ID1"

# 2. Upload test2.pdf
echo "📤 Uploading test2.pdf..."
UPLOAD2=$(curl -s -F "files=@test-assets/test2.pdf" $BASE_URL/api/upload)
ID2=$(echo $UPLOAD2 | grep -oP '"id":"\K[^"]+')
echo "✅ Upload 2 Success. ID: $ID2"

# 3. Test Merge
echo "📑 Testing Merge..."
MERGE_RES=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"fileIds\":[\"$ID1\", \"$ID2\"]}" $BASE_URL/api/tools/merge)
DOWNLOAD_URL=$(echo $MERGE_RES | grep -oP '"downloadUrl":"\K[^"]+')
if [[ $DOWNLOAD_URL == *"/api/download/"* ]]; then
  echo "✅ Merge Success. Download URL: $DOWNLOAD_URL"
else
  echo "❌ Merge Failed: $MERGE_RES"
fi

# 4. Test Compress
echo "📉 Testing Compress..."
COMPRESS_RES=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"fileIds\":[\"$ID1\"], \"level\":\"medium\"}" $BASE_URL/api/tools/compress)
C_URL=$(echo $COMPRESS_RES | grep -oP '"downloadUrl":"\K[^"]+')
if [[ $C_URL == *"/api/download/"* ]]; then
  echo "✅ Compress Success. URL: $C_URL"
else
  echo "❌ Compress Failed: $COMPRESS_RES"
fi

# 5. Test Watermark
echo "💧 Testing Watermark..."
WM_RES=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"fileIds\":[\"$ID2\"], \"text\":\"CONFIDENTIAL\"}" $BASE_URL/api/tools/watermark)
W_URL=$(echo $WM_RES | grep -oP '"downloadUrl":"\K[^"]+')
if [[ $W_URL == *"/api/download/"* ]]; then
  echo "✅ Watermark Success. URL: $W_URL"
else
  echo "❌ Watermark Failed: $WM_RES"
fi

# 6. Test Blog List
echo "📰 Testing Blog List..."
BLOG_RES=$(curl -s $BASE_URL/api/blogs)
if [[ $BLOG_RES == *"How to Merge PDF"* ]]; then
  echo "✅ Blog List Success."
else
  echo "❌ Blog List Failed or Empty."
fi

# 7. Test Invalid Upload
echo "🚫 Testing Invalid Upload (.txt)..."
INV_RES=$(curl -s -F "files=@test-assets/invalid.txt" $BASE_URL/api/upload)
if [[ $INV_RES == *"error"* ]]; then
  echo "✅ Invalid Upload Blocked Correctly."
else
  echo "❌ Invalid Upload was accepted! $INV_RES"
fi

echo "🏁 E2E API Tests Completed."
