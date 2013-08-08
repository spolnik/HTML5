"use strict";

function TaskAtHandApp()
{
    var version = "v3.3",
        appStorage = new AppStorage("taskAtHand"),
        taskList = new TaskList(),
        timeoutId = 0;

    function setStatus(msg, noFade)
    {
        $("#app>footer").text(msg).show();
        if (!noFade)
        {
            $("#app>footer").fadeOut(1000);
        }
    }

    function saveTaskList()
    {
        if (timeoutId) clearTimeout(timeoutId);
        setStatus("saving changes...", true);

        timeoutId = setTimeout(function()
            {
                appStorage.setValue("taskList", taskList.getTasks());
                timeoutId = 0;
                setStatus("changes saved.");
            },
            2000);
    }

    function loadTaskList()
    {
        var tasks = appStorage.getValue("taskList");
        taskList = new TaskList(tasks);
        rebuildTaskList();
    }

    function rebuildTaskList()
    {
        // Remove any old task elements
        $("#task-list").empty();

        // Create DOM elements for each task
        taskList.each(function(task)
        {
            addTaskElement(task);
        });
    }

    function addTask()
    {
        var taskName = $("#new-task-name").val();
        if (taskName)
        {
            var task = new Task(taskName);
            taskList.addTask(task);
            appStorage.setValue("nextTaskId", Task.nextTaskId);
            addTaskElement(task);
            saveTaskList();
            // Reset the field
            $("#new-task-name").val("").focus();
        }
    }

    function addTaskElement(task)
    {
        var $task = $("#task-template .task").clone();
        $task.data("task-id", task.id);
        $("span.task-name", $task).text(task.name);

        // Populate all of the details fields
        $(".details input, .details select", $task).each(function(i, e) {
            var $input = $(this);
            var fieldName = $input.data("field");
            $input.val(task[fieldName]);
        });

        $("#task-list").append($task);

        // Task events
        $task.click(function() { onSelectTask($task); });

        // Button events
        $("button.delete", $task).click(function() { removeTask($task); });
        $("button.move-up", $task).click(function() { moveTask($task, true); });
        $("button.move-down", $task).click(function() { moveTask($task, false); });
        $("button.toggle-details", $task).click(function() { toggleDetails($task); });

        // Task name events
        $("span.task-name", $task).click(function() { onEditTaskName($(this)); });
        $("input.task-name", $task).change(function() { onChangeTaskName($(this)); })
            .blur(function() { $(this).hide().siblings("span.task-name").show(); });

        // Task details events
        $(".details input, .details select", $task).change(function() { onChangeTaskDetails(task.id, $(this)); });
    }

    function onChangeTaskDetails(taskId, $input)
    {
        var task = taskList.getTask(taskId)
        if (task)
        {
            var fieldName = $input.data("field");
            task[fieldName] = $input.val();
            saveTaskList();
        }
    }

    function toggleDetails($task)
    {
        $(".details", $task).slideToggle();
        $("button.toggle-details", $task).toggleClass("expanded");
    }

    function removeTask($task)
    {
        $task.remove();
        saveTaskList();
    }

    function moveTask($task, moveUp)
    {
        if (moveUp)
        {
            $task.insertBefore($task.prev());
        }
        else
        {
            $task.insertAfter($task.next());
        }
        saveTaskList();
    }

    function onSelectTask($task)
    {
        if ($task)
        {
            // Unselect other tasks
            $task.siblings(".selected").removeClass("selected");
            // Select this task
            $task.addClass("selected");
        }
    }

    function onEditTaskName($span)
    {
        $span.hide()
            .siblings("input.task-name").val($span.text()).show().focus();
    }

    function onChangeTaskName($input)
    {
        $input.hide();
        var $span = $input.siblings("span.task-name");
        if ($input.val())
        {
            $span.text($input.val());
            saveTaskList();
        }
        $span.show();
    }

    function onChangeTheme()
    {
        var theme = $("#theme>option").filter(":selected").val();
        setTheme(theme);
        appStorage.setValue("theme", theme);
    }

    function setTheme(theme)
    {
        $("#theme-style").attr("href", "themes/" + theme + ".css");
    }

    function loadTheme()
    {
        var theme = appStorage.getValue("theme");
        if (theme)
        {
            setTheme(theme);
            $("#theme>option[value=" + theme + "]").attr("selected","selected");
        }
    }

    this.start = function()
    {
        $("#new-task-name").keypress(function(e)
        {
            if (e.which == 13) // Enter key
            {
                addTask();
                return false;
            }
        })
            .focus();

        loadTheme();
        $("#theme").change(onChangeTheme);

        $("#app>header").append(version);

        loadTaskList();
        setStatus("ready");
    };
}

$(function()
{
    window.app = new TaskAtHandApp();
    window.app.start();
});