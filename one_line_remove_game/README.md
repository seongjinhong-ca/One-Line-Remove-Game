# One-Line-Remove-Game

## Date of Completion : 2024/04/24

## Description:

```
"Created a game where players remove identical items by drawing a single line, testing their strategic thinking and pattern recognition skills."
```

## What I Learned:

```
I successfully developed a game utilizing Object-Oriented Programming (OOP) principles. By defining roles, responsibilities, and authority for each object class, I ensured a clear and organized codebase. Implementing the Model-View-Controller (MVC) architecture pattern was pivotal; it allowed me to separate concerns, distinguishing the distinct roles of each class with considering 4 different layers: host layer, concrete layer, base layer, utility layer in order from top to bottom; that are relative to neighboring layers as it can be relatively a basis layer of the above layer and it can be abstract layer relative to the below layer. Between host layer and concrete layer, host class layer uses the implementation of the concrete class layer and concrete class layer inherit the base class layer and the base class layers uses the functions provided from utility class layer.

Base class layer has Model(Item class), controller(Game class) and view(Renderer class) and Controller(Game class) communicates with view(Renderer) through message object as a form of passing a message as a parameter. And View(Renderer) has subView(ItemRender) which shows the has-a relationship and this is how View and Sub-view communicate each other.

Game class (Controller) has item (Model), which is as has-a relationship between them. Hence, the direction of knowing and communication is Game communicates to item since Game has item == knows the Item class. Also, the Game has a Renderer class(View) as a message (msg) and that is how game and Item communicate each other. Vise versa, Renderer class(View) has a ItemRenderer(Sub-view) as an item, meaning the Renderer class knows ItemRenderer class. Hence, the direction of communication between Renderer and ItemRenderer is from Renderer to ItemRender. Renderer has a Game class(Controller) as a message. Hence, Renderer communicates with Game class through game object as sa message.

DivRenderer class which is in a Concrete class layer extends (inherit) ItemRenderer which is in base class layer.

Also, as I develop the project, I was able to apply some design patterns such as Template methods when I have to . This project not only honed my programming skills but also taught me the importance of design patterns in creating scalable and maintainable software.
```

## Layer Separation

host

```
host code : html file
```

concrete

```
DivRenderer
    - inherit ItemRenderer
SectionRenderer
    - inherit Renderer
```

base

```
ItemRenderer (sub view)
    - don't know Renderer, Renderer will contact
Renderer (view) extends ThrowSet
    - has ItemRenderer as item as a authority (권한)
    - has Game as as message (msg) in Map as a key
    - inherit ThrowSet from UTIL
Game (Controller)
    - has Item(Model) as item as a authority (권한)
    - has Renderer as message (msg) in Ma as a key
Item (Model)
    - don't know Game, game will contact item
```

util

```
UTIL
- ThrowSet
```
