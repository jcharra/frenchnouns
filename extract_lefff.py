import json
import re

nouns = []
with open("words.json") as src:
    words = json.load(src)
    for word, gender in words.items():
        if gender not in ("M", "F"):
            print("Unknown gender", gender, "in", word)
            continue

        exp_parts = word.split()
        if any([re.search("[A-Z]{2}", e) for e in exp_parts]) or re.search("\d", word) or not re.search("[A-Za-zéèêâ]{2}", word):
            print("Ignoring", exp_parts)
            continue

        nouns.append([word, gender.lower()])


with open("nouns_lefff.js", "w") as out:
    print(f"Writing {len(nouns)} nouns to file")
    out.write(f"export const NOUNS = {nouns}")
