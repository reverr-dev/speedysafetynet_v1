# Product photographs

Last updated: 8 October 2026.

**All 27 products have a photograph.** Nothing is outstanding.

## How the site finds a picture

Purely by filename: `public/images/products/<slug>.jpg`. There is no list to
update and no code to change — drop the file in with the right name and the
product page uses it.

The slug is in `content/products.json`. Lowercase, hyphens, `.jpg` lowercase.
A file saved as `.JPG` or `.jpeg` will not be found, and the product will show
the striped "Photograph required" placeholder instead. `npm test` fails and
names the file if that happens, which is the only reason it would ever be
noticed before a customer saw it.

## Branding

The company mark is now **burned into each image by hand** before it goes in
the folder. The site does not add one.

It used to: a CSS rule painted the logo into the bottom-right corner of every
picture automatically. That was removed on 8 October at the client's request,
so that he controls exactly how his mark appears. The trade-off to remember is
that consistency is now a manual job — nothing enforces it.

Stamp every image the same way:

- Bottom-right corner
- About **24% of the image width**
- 3% margin from both edges

`public/images/brand/logo-stamp-bold.png` is an outlined version of the mark
made for this — white keyline and a soft halo, so it reads on a dark
photograph and a bright one without changing file.

Known inconsistencies in the current set, worth tidying when there is time:
the bird spike and twisted rope posters carry the mark top-right, and the
decorative grass mats photo has it top-left.

## Known weak file

`car-parking-shade-mesh.jpg` is only 350x235. It is fine on a catalogue card
but visibly soft on the product page, which renders two to three times wider.
Replace it if a larger copy turns up.

## Not published

**The Garware rope poster.** Another manufacturer's registered trademark and
artwork used as the whole design. Putting it on this site asserts a
relationship with that company. Do not publish it unless the client confirms
in writing that he is an authorised dealer and may use their brand assets.

**The running-track image.** Not a netting product, and the lettering rendered
into it is malformed. If the client wants it, it belongs on the Services page
as a project with a real location, not in the catalogue.
