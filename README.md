legend_of_cat
=============

Zelda style with a cat protagonist, in Javascript or python pygame?

Overworld Map
=============

Large MxN grid of screen sized map segments.  Moving between these would be like Zelda, walking off the screen through and entrance would result in scrolling to the next segment.  For simplicity the animated scroll effect would be deferred.   

Each screen map cell would consist of tiles, and the tiles would have metadata about their traversability.  Or a mix of tiles and larger special screen elements?  Need a tile map editor right away.  If not using tiles, could have two paired images, one with mask that shows areas that can be walked on and another value would denote impassable, and perhaps intermediate values for terrain that can be only passed in special conditions (player has an item/attribute to support it).

Arrow keys would move the cat character left right and up and down.

An action key could pick up items and use them.  Maybe only one special item could be carried at a time (like keys in Adventure?).

Making Levels/screens
=====================

Draw with pencil in gimp, fill in areas with distinct solid colors, select by color and then in new layer do a gradient fill.  Then dither the gradients:

convert level_test.png -dither FloydSteinberg -colors 16 level_test_dither.png

For the areas that can be walked around, create a mask image where white is walkable and black is not.  Maybe certain colors will be keyed to connect to other screens- walking to a certain shade of green on the mask will look in a map for that shade of green for the level to load.
