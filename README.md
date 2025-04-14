MADE USING AI for local personal usage.

A context menu based popup dictionary and thesaurus. 

How to install:

1. Download the project and unzip. delete the "placeholder" file in the icons folder - i am unable to delete it for some reason.

2. you need to visit https://dictionaryapi.com/ to apply for your own personal API KEY. Follow the steps mentioned on the site itself on how to obtain the keys. Choose the "Merriam-Webster's Collegiate® Dictionary with Audio" and "Merriam-Webster's Collegiate® Thesaurus" when filling the form.

3. replace the placeholder in "background.js" file with your newly made API keys. 

4. Merriam-Webster supports 1000 queries per day per API key, and use is limited to two reference APIs and is free as long as it is for non-commercial use so, it should be good enough for most people. 

5. After this, on firefox, visit "about:debugging" and go to "This Firefox". click "load temporary add-on" and locate the "manifest.json" file and select it. press ok and the extension should be up and running.

__________________________________________________________________________________________________________________________________________________________________________________________________________________________

At this point, the extension is a temporary version i.e you need to add it in about:debugging every time you open firefox. to make it a permanent version, 
Sign and Package the Extension (Recommended for Permanent Use)

1. Create a Mozilla Developer Account:
https://addons.mozilla.org/en-US/developers/

2. Package your extension as a .zip file containing your manifest.json and other files.

Zip the folder correctly:

  a. Navigate to the parent directory of my-extension/.

  b. Select all files inside the folder (not the folder itself).

  c. Right-click → Send to → Compressed (zipped) folder (on Windows)

3. Submit for Signing

  a. Go to: https://addons.mozilla.org/en-US/developers/addons

  b. Click "Submit a New Add-on"

  c. Choose "On your own" / "Unlisted"

  d. Upload your .zip file.

  e. Fill basic metadata (name, description), no need to publish to the public store.

  f. Mozilla will automatically review and sign it.

  g. Once done, you’ll get a signed .xpi file.

4. Download the signed .xpi file after approval.

5. Install it in Firefox permanently:

  a. Open Firefox.

  b. Go to about:addons → click ⚙️ → Install Add-on From File…

  c. Select your .xpi file.
