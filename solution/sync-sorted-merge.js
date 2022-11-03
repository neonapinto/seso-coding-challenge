"use strict";

//using priority queue to get a time complexity of O(nlogm)

const PriorityQueue = require('priorityqueuejs');

// Print all entries, across all of the sources, in chronological order.
module.exports = (log_sources, printer) => {
  
  //initialize the priority queue
  var priority_queue = new PriorityQueue(function(a, b) {
    if (a.node.date > b.node.date) return -1;
    if (a.node.date < b.node.date) return 1;
    return 0;
  });

  //conditions for enqueue log source 
  const enqueueUtil = (log_source) => {
    //if logsources is empty
    if (log_source.drained) {
      return false;
    }

    const node = log_source.pop();

    //check if log is undefined
    if (!node) {
      return false;
    }

    //Enqueue funtion to add into the priority queue 
    priority_queue.enq({
      node: node,
      log_source: log_source,
    });

    //if enqueuing is successful
    return true;

  }

  //enqueue all log sources
  for (const log_source of log_sources) {
    enqueueUtil(log_source);
  }

  /**
   * dequeue the highest priority and print it and 
   * enqueue ref to the logsource
   * **/

  while (!priority_queue.isEmpty()) {
    const log_obj = priority_queue.deq();
    printer.print(log_obj.node);
    enqueueUtil(log_obj.log_source);
  }

  // print the stats
  printer.done();
  return console.log("Sync sort complete.");
};
