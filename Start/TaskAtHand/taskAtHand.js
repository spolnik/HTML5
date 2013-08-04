"use strict";

function TaskAtHandApp() {
    var version = "v2.3",
        appStorage = new AppStorage('taskAtHand'),
        taskListKey = 'taskList',
        selectedClass = '.selected';

    function saveTaskList() {
        var tasks = [];
        $('#task-list .task span.task-name').each( function() {
            tasks.push($(this).text());
        });
        appStorage.setValue(taskListKey, tasks);
    }

    function loadTaskList() {
        var tasks = appStorage.getValue(taskListKey);
        if (tasks) {
            for (var i in tasks)
                addTaskElement(tasks[i]);
        }
    }

    function setStatus(message) {
        $('#app>footer').text(message);
    }

    function onEditTaskName($span) {
        $span.hide()
            .siblings('input.task-name')
            .val($span.text())
            .show()
            .focus();
    }

    function onChangeTaskName($input) {
        $input.hide();
        var $span = $input.siblings('span.task-name');
        if ($input.val()) {
            $span.text($input.val());
            saveTaskList();
        }
        $span.show();
    }

    function removeTask($task) {
        $task.remove();
        saveTaskList();
    }

    function moveTask($task, moveUp) {
        if (moveUp)
            $task.insertBefore($task.prev());
        else
            $task.insertAfter($task.next());
        saveTaskList();
    }

    function onSelectTask($task) {
        if ($task) {
            $task.siblings(selectedClass).removeClass(selectedClass);
            $task.addClass(selectedClass);
        }
    }

    function addTaskElement(taskName) {
        var $task = $('#task-template .task').clone();
        $('span.task-name', $task).text(taskName);

        $('#task-list').append($task);

        $('button.delete', $task).click(function() {
            removeTask($task);
        });

        $('button.move-up', $task).click(function() {
            moveTask($task, true);
        });

        $('button.move-down', $task).click(function() {
            moveTask($task, false);
        });

        $('span.task-name', $task).click(function() {
            onEditTaskName($(this));
        });

        $('input.task-name', $task).change(function() {
           onChangeTaskName($(this));
        })
        .blur(function() {
            $(this).hide().siblings('span.task-name').show();
        });

        $task.click(function() {
            onSelectTask($task);
        });
    }

    function addTask() {
        var taskName = $('#new-task-name').val();
        if (taskName) {
            addTaskElement(taskName);
            // Reset the text field
            $('#new-task-name').val('').focus();
            saveTaskList();
        }
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

    this.start = function() {
        $("#new-task-name").keypress(function (e) {
            if (e.which == 13) // Enter key
            {
                addTask();
                return false;
            }
        }).focus();

        loadTheme();
        $("#theme").change(onChangeTheme);

        $('#app>header').append(' ' + version);

        loadTaskList();
        setStatus("ready");
    }
}

$(function () {
    window.app = new TaskAtHandApp();
    window.app.start();
});
