/**
 * Function to parse fields object and return list
 * @param {info} - GraphQL info object
 * @todo implement recursive parsing for deeply nested queries
 */
function createFieldsObject(info) {
  rootNode = {name:"root", children: []};
  currentParent = null;
  leaves = [];

  function traverseSelection( selection ) {

    if ( selection.selectionSet ) {
      if (!currentParent) {
        currentParent = { 
          name: selection.name.value,
          parent: rootNode,
          children: []
        };
        rootNode.children.push(currentParent);
      } else {
        currentParent = { 
          name: selection.name.value,
          parent: currentParent,
          children: []
        };
      }
      
      
      selection.selectionSet.selections.map( (selection) => traverseSelection(selection) );
    } else {
      if (!currentParent) {
        leaf = {
          name: selection.name.value,
          parent: rootNode,
          children: null
        };
        rootNode.children.push(leaf);
        leaves.push(leaf);
      } else {
        var leaf = {
          name: selection.name.value,
          parent: currentParent,
          children: null
        };
        currentParent.children.push(leaf);
        leaves.push(leaf);
      }
    }

  }
  
  // START ON EACH ROOT NODE
  info.fieldNodes[0].selectionSet.selections.map((rootSelection) => {
    traverseSelection(rootSelection);
  });


  var visitFunction = (name) => {};
  /**
   * 
   * @param {*} node The node in currently in question (Start with the root!)
   * @param {*} fn The visit function to be called
   */
  function PostOrderTreeTraversal(node, callback) {
    //visit the node
    if (node.children) {
      node.children.map((child) => PostOrderTreeTraversal(child, visitFunction));
      callback(node.name);
    }
    else {
      callback(node.name + " *leaf*");
    }
    
  }
  
  PostOrderTreeTraversal(rootNode, visitFunction);
  
  
  var fields = [];

  info.fieldNodes[0].selectionSet.selections.map((fieldObj) => {
        
    if (fieldObj.selectionSet) {
      var subselections = [];
      fieldObj.selectionSet.selections.map((fieldobj) => {
        subselections.push(fieldobj.name.value);
      });
      fields.push({
        name: fieldObj.name.value,
        subFields: subselections
      });
    } else {
      fields.push({name: fieldObj.name.value});
    }

  });
  
  return fields;

}

module.exports = createFieldsObject;