"use strict";

// Print all entries, across all of the *async* sources, in chronological order.

const PriorityQueue = require('priorityqueuejs');

// Print all entries, across all of the sources, in chronological order.

module.exports = async (log_sources, printer) => {

  //threshold to save some memory 
  const THRESHOLD = 500;

  //initialize the priority queue
  var priority_queue = new PriorityQueue(function(a, b) {
    if (a.item.date > b.item.date) return -1;
    if (a.item.date < b.item.date) return 1;
    return 0;
  });

  //conditions for enqueue log source 
  const enqueueUtil = async (log_source) => {
    //if log source is empty or crosses the threshold
    if (log_source.drained || priority_queue.size() > THRESHOLD) {
      return false;
    }

    const node = await log_source.popAsync();
    //check if it exists
    if (!node) {
      return false;
    }

    //enqueue the log
    priority_queue.enq({
      node: node,
      log_source: log_source,
    });

    //if successful
    return true;

  }

  //enqueue function to run all of enqueue asynchronously.  
  await Promise.all(log_sources.map(async log_source => {
    await enqueueUtil(log_source);
  }));

  //enqueue function to run all of enqueue  asynchronously.  
  while (!priority_queue.isEmpty()) {
    //dequeue the log with lowest date
    const log_obj = priority_queue.deq();
    //print the log
    printer.print(log_obj.item);

    //and then asynchronously enqueue it
    await Promise.all(log_sources.map(async () => {
      await enqueueUtil(log_obj.log_source);
    }));
  }

  // print the stats
  printer.done();

  return new Promise((resolve, reject) => {
    resolve(console.log("Async sort complete."));
  });
};
