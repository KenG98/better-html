# The Problem With HTML

A lot has changed since the early days of the internet in the 90s, but a few things have not, including HTML, the markup language which describes how webpages are rendered in the browser. 

HTML has remained the same, but the webpages it displays have changed a lot - these days we have reactive sites which look good on all devices, transition smoothly, and are in general way nicer to use.

That has created a disconnect - it's now a big pain to create good responsive pages. It's impossibly difficult in plain HTML, CSS and Javascript (just a giant headache), so frameworks like Bootstrap have naturally come about. Bootstrap is an attempt to create an abstraction on top of the current HTML/CSS/JS stack to make it modern, responsive, and friendly.

But no framework is perfect, and it's a temporary bandaid on the current state of affairs. It's 2018 and it's still impossibly hard to write a responsive three column layout in HTML, and even with Bootstrap it takes 15 lines of code to make three simple columns. Not to mention the readability mess which is XML, angle brackets, closing tags, etc.

Templating languages like Jade improve on HTML quite a bit and attack the problem of ease of use and readability, but doesn't impact responsiveness much. 

A Jade + Bootstrap combination comes close to solving the problem, but it's still not first class, and still a hack which involves messing with Classes, IDs, messy HTML structures, etc. According to any web developer these days, that's not the worst thing in the world, but we don't want to settle for less, we want the best language out there, and in 2018, it's time for an abstraction which really makes website programming simple (and isn't a drag and drop website builder).

Why are we still worrying about paragraphs, closing tags, divs, spans, classes, IDs, meta, head tags, stylesheet syntax, ...

In 2018, it should take one line of code to create a responsive grid layout. HTML is here to stay for a while, and the real problem lies within browsers, the HTML specification, and rendering pages. However... 

# Introducing BetterHTML (BHTML)

BetterHTML is an attempt to fix the situation. BetterHTML is a website markup language which aims to be "high-level" and abstract away the work of creating modern and responsive web pages. Want three columns? Write the words "3 columns" to your editor!

BetterHTML gives you a great language to write your web page in, and then compiles it to HTML so that the browser can render it. It's also a temporary hack in the grand scheme of things, but many people will appreciate it like we appreciated Bootstrap. It's not impossible to see a future in which browsers can directly render BetterHTML or one of it's offspring languages.
