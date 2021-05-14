# Stupid Simple Svelte Static Site Generator (5SG)

## Introduction

5sg stands for **s**tupid **s**imple **s**velte **s**tatic **s**ite generator. It's a static site generator (SSG) in the making which focuses on ease of development, simplicity of structure, and speed of delivery. It takes in markdown and svelte, and outputs html. I had planned on changing the name, but 🤷‍♀️.

## Questions and answers

### What's the deal with the tsconfig file ?

This project doesn't use Typescript, yet, mostly because I wanted to avoid a build step. But I nonetheless wanted to make sure that I had a way to implement type-safety. I'm using a weird mash up of js-doc style type declarations along with a ts-config file so that my text editor and linter can catch type errors. It's hacky, but what about this project ISN'T ?
