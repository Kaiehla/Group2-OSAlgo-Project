$(document).ready(
   function(){

       $(".form-group-time-quantum").hide();

       // Show hide RR time quantum
       $('#algorithmSelector').on('change', function(){
           if(this.value === 'optRR') {
               $(".form-group-time-quantum").show(1000);
           } else {
               $(".form-group-time-quantum").hide(1000);
           }
       });


       var processList = [];

       $('#btnAddProcess').on('click', function(){
           var processID = $('#processID');
           var arrivalTime = $('#arrivalTime');
           var burstTime = $('#burstTime');

           if(processID.val() === '' || arrivalTime.val() === '' || burstTime.val() === ''){
               processID.addClass('is-invalid');
               arrivalTime.addClass('is-invalid');
               burstTime.addClass('is-invalid');
               return;
           }

           var process = {
               processID: parseInt(processID.val(), 10),
               arrivalTime: parseInt(arrivalTime.val(), 10),
               burstTime: parseInt(burstTime.val(), 10)
           }

           processList.push(process);
           
           $('#tblProcessList > tbody:last-child').append(
               `<tr>
                   <td id="tdProcessID">${processID.val()}</td>
                   <td id="tdArrivalTime">${arrivalTime.val()}</td>
                   <td id="tdBurstTime">${burstTime.val()}</td>
               </tr>`
           );

           processID.val('');
           arrivalTime.val('');
           burstTime.val('');
       });

       $('#btnCalculate').on('click', function(){

           if (processList.length == 0) {
               alert('Please insert some processes');
               return;
           }

           var selectedAlgo = $('#algorithmSelector').children('option:selected').val();

           if (selectedAlgo === 'optFCFS') {
               firstComeFirstServed();
           }

           if (selectedAlgo === 'optSJF') {
               shortestJobFirst();
           }

           if (selectedAlgo === 'optSRTF') {
               shortestRemainingTimeFirst();
           }

           if (selectedAlgo === 'optRR') {
               roundRobin();
           }
       });

       function firstComeFirstServed(){
           var time = 0;
           var queue = [];
           var completedList = [];

           while (processList.length > 0 || queue.length > 0) {
               while (queue.length == 0) {
                   time++;
                   addToQueue();
               }

               // Dequeue from queue and run the process.
               process = queue.shift();
               for(var i = 0; i < process.burstTime; i++){
                   time++
                   addToQueue();
               }   
               process.completedTime = time;
               process.turnAroundTime = process.completedTime - process.arrivalTime;
               process.waitingTime = process.turnAroundTime - process.burstTime;
               completedList.push(process);
           }

           function addToQueue() {
               for(var i = 0; i < processList.length; i++) {
                   if(time >= processList[i].arrivalTime) {
                       var process = {
                           processID: processList[i].processID, 
                           arrivalTime: processList[i].arrivalTime, 
                           burstTime: processList[i].burstTime
                       }
                       processList.splice(i, 1);
                       queue.push(process);
                   }
               }
           }

           // Bind table data
           $.each(completedList, function(key, process){
               $('#tblResults > tbody:last-child').append(
                   `<tr>
                       <td id="tdProcessID">${process.processID}</td>
                       <td id="tdArrivalTime">${process.arrivalTime}</td>
                       <td id="tdBurstTime">${process.burstTime}</td>
                       <td id="tdBurstTime">${process.completedTime}</td>
                       <td id="tdBurstTime">${process.waitingTime}</td>
                       <td id="tdBurstTime">${process.turnAroundTime}</td>
                   </tr>`
               );
           });

           // Get average
           var avgTurnaroundTime = 0;
           var avgWaitingTime = 0;
           var maxCompletedTime = 0;

           $.each(completedList, function(key, process){
               if (process.completedTime > maxCompletedTime) {
                   maxCompletedTime = process.completedTime;
               }
               avgTurnaroundTime = avgTurnaroundTime + process.turnAroundTime;
               avgWaitingTime = avgWaitingTime + process.waitingTime;
           });

           $('#avgTurnaroundTime').val( avgTurnaroundTime / completedList.length );
           $('#avgWaitingTime').val( avgWaitingTime / completedList.length );
           $('#throughput').val(completedList.length / maxCompletedTime);
       }

       
       function shortestJobFirst(){
           var completedList = [];
           var time = 0;
           var queue = [];

           while (processList.length>0 || queue.length>0) {
               addToQueue();
               while (queue.length==0) {                
                   time++;
                   addToQueue();
               }
               processToRun = selectProcess();
               for (var i = 0; i < processToRun.burstTime; i++) {
                   time++;
                   addToQueue();
               }
               processToRun.processID = processToRun.processID;
               processToRun.arrivalTime = processToRun.arrivalTime;
               processToRun.burstTime = processToRun.burstTime;
               processToRun.completedTime = time;
               processToRun.turnAroundTime = processToRun.completedTime - processToRun.arrivalTime;
               processToRun.waitingTime = processToRun.turnAroundTime - processToRun.burstTime;
               completedList.push(processToRun);
           }
           function addToQueue() {
               for(var i = 0; i < processList.length; i++) {
                   if(processList[i].arrivalTime <= time) {
                       var process = {
                           processID: processList[i].processID, 
                           arrivalTime: processList[i].arrivalTime, 
                           burstTime: processList[i].burstTime
                       }
                       processList.splice(i, 1);
                       queue.push(process);
                       i--;
                   }
               }
           }
           function selectProcess() {
               if (queue.length!=0) {
                   queue.sort(function(a, b){
                       if (a.burstTime > b.burstTime) {
                           return 1;
                       } else {
                           return -1;
                       }
                   });
               }
               var process = queue.shift();
               return process;
           }

           // Bind table data
           $.each(completedList, function(key, process){
               $('#tblResults > tbody:last-child').append(
                   `<tr>
                       <td id="tdProcessID">${process.processID}</td>
                       <td id="tdArrivalTime">${process.arrivalTime}</td>
                       <td id="tdBurstTime">${process.burstTime}</td>
                       <td id="tdBurstTime">${process.waitingTime}</td>
                       <td id="tdBurstTime">${process.waitingTime}</td>
                       <td id="tdBurstTime">${process.turnAroundTime}</td>
                   </tr>`
               );
           });

           // Get average
           var avgTurnaroundTime = 0;
           var avgWaitingTime = 0;
           var maxCompletedTime = 0;
        //    var throughput = 0;
           var avgResponseTime = 0;

           $.each(completedList, function(key, process){
               if (process.completedTime > maxCompletedTime) {
                   maxCompletedTime = process.completedTime;
               }
               avgTurnaroundTime = avgTurnaroundTime + process.turnAroundTime;
               avgWaitingTime = avgWaitingTime + process.waitingTime;
           });

           $('#avgTurnaroundTime').val( avgTurnaroundTime / completedList.length );
           $('#avgWaitingTime').val( avgWaitingTime / completedList.length);
           $('#avgResponseTime').val(avgWaitingTime / completedList.length);
       }

       function shortestRemainingTimeFirst() {
           var completedList = [];
           var time = 0;
           var queue = [];
           
           while ( processList.length>0 || queue.length>0 ) {
               addToQueue();
               while (queue.length==0) {                
                   time++;
                   addToQueue();
               }
            selectProcessForSRTF();
            runSRTF();
           }

           function addToQueue() {
               for(var i = 0; i < processList.length; i++) {
                   if(processList[i].arrivalTime === time) {
                       var process = {
                           processID: processList[i].processID, 
                           arrivalTime: processList[i].arrivalTime, 
                           burstTime: processList[i].burstTime,
                           startTime: null
                       }
                       processList.splice(i, 1);
                       queue.push(process);
                   }
               }
           }
           function selectProcessForSRTF() {
               if (queue.length != 0) {
                   queue.sort(function(a, b){
                       if (a.burstTime > b.burstTime) {
                           return 1;
                       } else {
                           return -1;
                       }
                   });
                   if (queue[0].burstTime == 1) {
                       process = queue.shift();
                       process.completedTime = time + 1;
                       completedList.push(process);

                   } else if(queue[0].burstTime > 1){
                       process = queue[0];
                       queue[0].burstTime = process.burstTime - 1;
                   }
               }
           }
           function runSRTF() {
               time++;
               addToQueue();
           }

           // Fetch table data
           var TableData = [];
           $('#tblProcessList tr').each(function(row, tr) {
               TableData[row] = {
                   "processID": parseInt($(tr).find('td:eq(0)').text()),
                   "arrivalTime": parseInt($(tr).find('td:eq(1)').text()),
                   "burstTime": parseInt($(tr).find('td:eq(2)').text())
               }
           });

           // Remove header row
           TableData.splice(0, 1);
           
           // Reset burst time
           TableData.forEach(pInTable => {
               completedList.forEach(pInCompleted => {
                   if (pInTable.processID == pInCompleted.processID) {
                       pInCompleted.burstTime = pInTable.burstTime;
                       pInCompleted.turnAroundTime = pInCompleted.completedTime - pInCompleted.arrivalTime;
                       pInCompleted.waitingTime = pInCompleted.turnAroundTime - pInCompleted.burstTime;
                   }
               });
           });

           // Bind table data
           $.each(completedList, function(key, process){
               $('#tblResults > tbody:last-child').append(
                   `<tr>
                       <td id="tdProcessID">${process.processID}</td>
                       <td id="tdArrivalTime">${process.arrivalTime}</td>
                       <td id="tdBurstTime">${process.burstTime}</td>
                       <td id="tdBurstTime">${process.completedTime}</td>
                       <td id="tdBurstTime">${process.waitingTime}</td>
                       <td id="tdBurstTime">${process.turnAroundTime}</td>
                   </tr>`
               );
           });

           // Get average
           var avgTurnaroundTime = 0;
           var avgWaitingTime = 0;
           var maxCompletedTime = 0;
           var throughput = 0;

           $.each(completedList, function(key, process){
               if (process.completedTime > maxCompletedTime) {
                   maxCompletedTime = process.completedTime;
               }
               avgTurnaroundTime = avgTurnaroundTime + process.turnAroundTime;
               avgWaitingTime = avgWaitingTime + process.waitingTime;
           });

           $('#avgTurnaroundTime').val( avgTurnaroundTime / completedList.length );
           $('#avgWaitingTime').val( avgWaitingTime / completedList.length );
           $('#throughput').val(completedList.length / maxCompletedTime);
       }
       //ielle: under construction
       function roundRobin() {
        //get time-quantum
           var timeQuantum = $('#timeQuantum');
           var timeQuantumVal= parseInt(timeQuantum.val(), 10);
           //correct

           //check if quantum is empty
             if (isNaN(timeQuantumVal) || timeQuantumVal <= 0) {
        alert('Please enter a valid time quantum');
       timeQuantum.addClass('is-invalid');
       return;
   }
           //variable initialization
           var completedList = [];
           var time = 0;
           var queue = [];
           // main looping process
           while (processList.length > 0 || queue.length > 0) {
               addToQueue();
               while (queue.length == 0) {               
                   time++;
                   //function
                   addToQueue();
               }
               selectProcessForRR();
           }

           function addToQueue() {
            for (var i = 0; i < processList.length; i++) {
                if (processList[i].arrivalTime === time) {
                    var process = {
                        processID: processList[i].processID,
                        arrivalTime: processList[i].arrivalTime,
                        burstTime: processList[i].burstTime,
                        startTime: null // Added startTime property
                    };
                    processList.splice(i, 1);
                    queue.push(process);
                }
            }
           }
           
           function selectProcessForRR() {
            if (queue.length != 0) {
                var process = queue.shift(); // Dequeue the first process
                var burstRemaining = Math.min(timeQuantumVal, process.burstTime);
                
                 // Set start time if it's the first time the process is selected
           if (process.startTime === null) {
                process.startTime = time;
                }

                for (var index = 0; index < burstRemaining; index++) {
                    time++;
                    addToQueue();
                }
    
                process.burstTime -= burstRemaining;
    
                if (process.burstTime > 0) {
                    // If burst time is remaining, enqueue it back with updated burst time
                    queue.push(process);
                } else {
                    // If burst time is zero, update completion time, waiting time, and turnaround time
                    process.completedTime = time;
                    process.turnAroundTime = process.completedTime - process.arrivalTime;
                    process.waitingTime = process.turnAroundTime - process.burstTime;
                    completedList.push(process);
                }
            }
           }

           // Fetch initial table data
           var TableData = [];
           $('#tblProcessList tr').each(function(row, tr) {
               TableData[row] = {
                   "processID": parseInt($(tr).find('td:eq(0)').text()),
                   "arrivalTime": parseInt($(tr).find('td:eq(1)').text()),
                   "burstTime": parseInt($(tr).find('td:eq(2)').text())
               }
           });

           // Remove table header row
           TableData.splice(0, 1);
           
           // Reset burst time from original input table.
           TableData.forEach(pInTable => {
               completedList.forEach(pInCompleted => {
                   if (pInTable.processID==pInCompleted.processID) {
                       pInCompleted.burstTime= pInTable.burstTime;
                       pInCompleted.turnAroundTime = pInCompleted.completedTime - pInCompleted.arrivalTime;
                       pInCompleted.waitingTime = pInCompleted.turnAroundTime - pInCompleted.burstTime;
                   }
               });
           });

           // Bind table data
           $.each(completedList, function(key, process){
               $('#tblResults > tbody:last-child').append(
                `<tr>
                <td class="tdProcessID">${process.processID}</td>
                <td class="tdArrivalTime">${process.arrivalTime}</td>
                <td class="tdBurstTime">${process.burstTime}</td>
                <td class="tdResponseTime">${process.startTime !== null ? process.startTime - process.arrivalTime : 0}</td>
                <td class="tdWaitingTime">${process.waitingTime}</td>
                <td class="tdTurnAroundTime">${process.turnAroundTime}</td>
            </tr>`
               );
           });
               
           // Get average
           var totalTurnaroundTime = 0;
           var totalWaitingTime = 0;
           var totalResponseTime = 0;
           var maxCompletedTime = 0;

           $.each(completedList, function(key, process){
               if (process.completedTime > maxCompletedTime) {
                   maxCompletedTime = process.completedTime;
               }
               totalTurnaroundTime = totalTurnaroundTime += process.turnAroundTime;
               totalWaitingTime = totalWaitingTime += process.waitingTime;
               totalResponseTime += process.startTime !== null ? process.startTime - process.arrivalTime : 0;
            });
            $('#avgTurnaroundTime').val((totalTurnaroundTime / completedList.length).toFixed(2));
            $('#avgWaitingTime').val((totalWaitingTime / completedList.length).toFixed(2));
            $('#avgResponseTime').val((totalResponseTime / completedList.length).toFixed(2));
            $('#throughput').val((completedList.length / maxCompletedTime).toFixed(2));
           
       }
      
   }
);