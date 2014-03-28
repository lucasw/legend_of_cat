legend_of_cat
=============

Move a cat around different screens like old adventure games.  So far no arcade elements, just exploration, but collecting items to unlock new areas will probably happen, as well as collecting other items just for points/completeness.

Overworld Map
=============

Move around screens and interact with small number of elements on each, walking onto an exit zone transports to a new screen.  Some special elements may pose barriers that can be overcome with the right item or through simple interactions.

Arrow keys and wasd move the cat character left right and up and down.

An action key could pick up items and use them.  Maybe only one special item could be carried at a time (like keys in Adventure?).

Making Levels/screens
=====================

Draw with pencil in gimp, fill in areas with distinct solid colors, select by color and then in new layer do a gradient fill.  Then dither the gradients:

convert level_test.png -dither FloydSteinberg -colors 16 level_test_dither.png

For the areas that can be walked around, create a mask image where white is walkable and black is not.  In a second mask image certain colors will be keyed to connect to other screens- walking to a certain shade of green on the mask will look in a map for that shade of green for the level to load.
