legend_of_cat
=============

Zelda style with a cat protagonist, in Javascript or python pygame?

Overworld Map
=============

Large MxN grid of screen sized map segments.  Moving between these would be like Zelda, walking off the screen through and entrance would result in scrolling to the next segment.  For simplicity the animated scroll effect would be deferred.   

Each screen map cell would consist of tiles, and the tiles would have metadata about their traversability.  Or a mix of tiles and larger special screen elements?  Need a tile map editor right away.  If not using tiles, could have two paired images, one with mask that shows areas that can be walked on and another value would denote impassable, and perhaps intermediate values for terrain that can be only passed in special conditions (player has an item/attribute to support it).

Arrow keys would move the cat character left right and up and down.

An action key could pick up items and use them.  Maybe only one special item could be carried at a time (like keys in Adventure?).

