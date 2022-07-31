import {unified} from "unified"
import type {CompilerFunction} from "unified"
import {stream} from "unified-stream"
import remarkParse from "remark-parse"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import type {Code} from "mdast"
import {createReadStream, existsSync} from "fs"
import CodeNodeProcessor from "./lib/code-node-processor.js"
export function usage(error: Error) {
  process.stderr.write(error.message + "\n")
  process.stdout.write("lima tangle <file>\n")
  process.exit(2)
}
function getStream(path?: string) {
  if (path) {
    if (existsSync(path)) {
      return createReadStream(path)
    } else {
      throw new Error(`no such file ${path}`)
    }
  } else {
		return process.stdin
  }
}
function tangle(this: typeof tangle) {
  let code = new CodeNodeProcessor
  Object.assign(this, {Compiler: walk})
  async function walk(node: any) {
    if (node.type == "code") {
      await code.process(node as Code)
    } else if ("children" in node && Array.isArray(node.children)) {
      for (let child of node.children) {
        await walk(child)
      }
    }
  }
}
export function cli(args: string[]) {
  let [command, filename] = args
  if (command != "tangle") {
    throw new Error("only tangling is supported")
  }

  let input = getStream(filename)

  input.pipe(stream(
	 unified()
		 .use(remarkParse)
		 .use(remarkFrontmatter)
		 .use(remarkGfm)
		 .use(tangle)
  ))
}
