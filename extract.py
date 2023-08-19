import json
import re

nouns = []
with open("nouns_raw.json") as src:
    for line in src:
        try:
            data = json.loads(line)
            ht = data["head_templates"]
            if len(ht) != 1:
                # print("Deviation for line", line)
                pass
            ht_data = ht[0]
            if ht_data["name"] != "fr-noun":
                continue
            gen = ht_data["args"]["1"]
            if gen not in ("m", "f"):
                # print("Unknown gender", gen, "in line", line)
                continue
            exp_data = ht_data["expansion"].split()
            if gen not in exp_data:
                print("Gender not contained in line", line)
                continue
            if any([re.match("^[A-Z][A-Z]+$", e) for e in exp_data]):
                print("Ignoring", exp_data)
                continue

            # Check the actual word
            expression = " ".join(exp_data[:exp_data.index(gen)])
            if re.match("\d+", expression):
                print("Ignoring ", expression)
                continue

            # Try to find the mp3 URL
            mp3_url = ""
            for d in data.get("sounds", []):
                if d.get("mp3_url"):
                    mp3_url = d["mp3_url"]

            # Only use record if complete
            if mp3_url:
                nouns.append([expression, gen, mp3_url])
        except:
            # print("Error for line", line)
            pass

with open("nouns.js", "w") as out:
    out.write(f"export const NOUNS = {nouns}")
