#!/bin/bash

echo "🔐 Schritt 1: Firebase Login"
echo "Bitte führe im Terminal aus: firebase login"
echo ""
echo "Danach kann ich die Rules prüfen mit:"
echo "  firebase use bellavue-eventzentrum"
echo "  firebase deploy --only firestore:rules --dry-run"
echo ""
echo "Oder direkt die Rules aus Firebase abrufen:"
echo "  firebase firestore:rules:get"

