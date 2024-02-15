
- arrays order is not modified
- processing can be custom for leaf and for path (can use * for all array entrance processing) Example pets.data[*].name

TODO:
- Add express support? Evaluate
  - This can be used to keep a consitent json format when retrieving answers and can also be used to filter undesired fields to show.
- Plugin logic for easy extend
- add custom path processing (not just for leafs)
- add path keys custom processors
- update template logic to receive custom path processors in the template itself, insead of receiving a separated customPath option
