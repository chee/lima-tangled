#!/usr/bin/env node
import {cli, usage} from "../dist/lima.js"
try {
	cli(process.argv.slice(2))
} catch(error) {
	usage(error)
}
