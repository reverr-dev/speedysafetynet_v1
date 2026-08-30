# Clean originals

Written and read by `scripts/watermark.py`. Do not edit by hand.

Two kinds of file live here:

* `<folder>__<name>.jpg` — the clean, unstamped original of a picture the
  script has marked. Re-running with `--force` restores from this first, so
  the mark never compounds. Delete one and that picture can no longer be
  rolled back.

* `<folder>__<name>.jpg.stamped-no-original` — an empty flag. The picture is
  stamped, but it was stamped by an early version of this script that kept no
  original. There is nothing to roll it back to, so the script leaves those
  files alone entirely, `--force` included. To re-do one, replace the picture
  with a clean copy from the client's originals and delete its flag.

Both are committed deliberately. They are small, and without them a second run
of the script on a fresh clone would put a second logo on every photograph.
