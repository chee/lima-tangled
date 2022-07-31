import type {Code} from "mdast"
import expandTilde from "untildify"
import path from "path"
import MetalineParser from "./metaline-parser.js"
import makeDirectory from "make-dir"
import {createWriteStream} from "fs"
export default class CodeNodeProcessor {
  seen: Set<string> = new Set
  parser = new MetalineParser()
  async process(code: Code) {
    if (!code.meta) {
      // i only tangle with meta
      return
    }
    let meta = this.parser.parse(code.meta)
    if (typeof meta.filename == "string") {
      let fn = expandTilde(meta.filename)
      let seen = this.seen.has(fn)
      this.seen.add(fn)
      let shebang = meta.shebang || meta["#!"]
      if (path.basename(fn) != fn) {
        await makeDirectory(path.dirname(fn))
      }
      let stream = createWriteStream(fn, {
        encoding: "utf-8",
        flags: seen ? "a" : "w",
        mode: shebang
          ? 0o755
          : undefined
      })

      if (shebang && !seen) {
        stream.write("#!" + shebang + "\n")
      } else if (shebang) {
                process.stderr.write(`warning: ignoring shebang on already-seen file\n`)
          process.stderr.write(`(only the first reference to a file should set a shebang)\n`)
      }

		stream.write(code.value + "\n")
      stream.close()

      return new Promise(yay => {
        stream.on("close", yay)
      })
    } else if ("filename" in meta) {
      throw new TypeError(`filename must be a string, got ${meta.filename}`)
    }
  }

}
