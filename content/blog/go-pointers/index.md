---
Authors: 
- chrisreddington
Description: "I'll be transparent. The purpose of this post is to help with my own understanding of the Go & and * operators. It's going to be a very short post, and I'm going to try to explain the concepts in a way that I can understand. I've used these operators in C previously, but whenever I'm using them - I always end up having to remember the syntax / which operator is which / what they do. For whatever reason, it doesn't always come intuitively to me."
PublishDate: "2022-05-01T13:00:00Z"
image: img/cloudwithchrislogo.png
PublishDate: "2022-05-01T13:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Go
- Golang
- Programming
- Pointers
- Developers
- App Development
- Visual Studio Code
banner: "images/banner.png"
title: Go Pointers - Using the & and * operators
---
I'll be transparent. The purpose of this post is to help with my own understanding of the Go & and * operators. It's going to be a very short post, and I'm going to try to explain the concepts in a way that I can understand. I've used these operators in C previously, but whenever I'm using them - I always end up having to remember the syntax / which operator is which / what they do. For whatever reason, it doesn't always come intuitively to me.

## Passing arguments into a function

For any piece of code to be reusable, we typically encapsulate into a function. A function is a reusable piece of code that can be called multiple times. We also usually pass arguments into a function, so that the function can be applied to different inputs (i.e. a consistent execution based on a dynamic input).

## Passing arguments by value

In the example below, we have a function called messageOutput that takes in a string and returns the value. The return value is then printed to the console via the main function.

```go
package main

import "fmt"

func main() {
  // Initialise and set a string s
  // to 'Hello'
  s := "Hello"

  // Write out the string to the console
  // Return the string for our later step.
  fmt.Println("Function Output: " + messageOutput(s))
  fmt.Println("Value of s in main function: " + s)
}

// Concatenate the input string with 'World'
func messageOutput(s string) string {
  s = s + " World"
  return s
}
```

This example passes a copy of the value into the function. This means that the value is copied into another memory location, and the original value is not affected.

> **Thought:** This does mean there might be a slight performance hit, as the function is copying the value into a new memory location. This of course depends on the size of the data being copied. If the data is small, then this might not be an issue.
>
> The community stance seems to that optimising for problems too early is a bad idea. Go for the simplest option first, and then optimise later if necessary (i.e. if performance analysis shows that there is a problem).

Therefore, the output of the above function is:

```bash
Function Output: Hello World
Value of s in main function: Hello
```

## Passing arguments by pointer

Below, we once again have a function called messageOutput. However, this time the function takes a pointer (to a string) as an argument rather than a string. This means that the function can modify the value of the original string.

```go
package main

import "fmt"

func main() {
  // Initialise and set a string s
  // to 'Hello World'
  s := "Hello"

  // Write out the string to the console
  // Return the string for our later step.
  fmt.Println("Function Output: " + *messageOutput(&s))
  fmt.Println("Value of s in main function: " + s)
}

// Concatenate the input string with 'World'
func messageOutput(s *string) *string {
  *s += " World"
  return s
}
```

That means the output of this function will be:

```bash
Function Output: Hello World
Value of s in main function: Hello World
```

However, there is another problem here. The messageOutput function depends upon the pointer (i.e. the memory location) that is passed in. If the value is deleted, then the function will no longer be able to access the value and potentially cause a runtime error.

This isn't a problem in the simple example above, but it can be a problem in more complex scenarios. You'll need to think through the lifecycle of the pointer, and make sure that you don't delete the value before you're done with it.

## Exploring the * and & operators

There are a few examples to focus in on as below.

### Declaring pointers as the argument type in a function

In the second example's function signature, we have a pointer to a string, i.e. ``func messageOutput(s *string) ...``. This means that the function will take a pointer to a string as an argument.

We are able to return s in the function, as s is already a pointer. We do not need to dereference it (e.g. ``*s``), as then it would be a value of type ``**string``.

## Using the * to dereference a pointer

Dereference sounds like a fancy term, and I think that's the part which typically causes my confusion. It's a fancy way of saying you're taking the value of the pointer and returning it.

Take a look at the messageOutput method of the second example. We have ``*s += " World"``. We are setting the value of the pointer to the value of the pointer plus the string " World". This would be the same as ``*s = *s + " World"``.

Ultimately, dereference means **get the value of the pointer**.

## Using the & to get the address of a pointer

On the flip side, the ``&`` operator is used to get the address of a pointer. This is useful when you want to pass a pointer to a function.

Notice the line ``fmt.Println("Function Output: " + *messageOutput(&s))``?

We know that messageOutput takes a pointer as an argument. We can use the ``&`` operator to get the address of the string (therefore our pointer, i.e. where the value lives), which we pass into the function.

We also know that messageOutput returns a pointer, so we can use the ``*`` operator in the main method to dereference the pointer (i.e. the return value of the messageOutput method) and concatenate the value within the string.

## Conclusion

This made some sense in my mind. I think typing it up helped with my understanding! What do you think? Have I missed something, or perhaps misunderstood? Do you have any tips/tricks to make this easier to understand?

As an aside, how have you found this very focused and short post? If it's helpful, I'd love to hear your thoughts, to encourage me to write more of them! Please drop a comment below, and let me know what you think! Thanks!
