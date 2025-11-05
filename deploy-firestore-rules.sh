#!/bin/bash

# Script zum Deployen der Firestore Security Rules

echo "🔍 Prüfe Firebase Login..."
firebase login:list

echo ""
echo "📋 Prüfe Firestore Rules Syntax..."
firebase deploy --only firestore:rules --dry-run

echo ""
echo "✅ Wenn keine Fehler angezeigt wurden, Rules deployen mit:"
echo "   firebase deploy --only firestore:rules"

