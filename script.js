var recipes = {};

var recipesAdded = [];

var countMatch = /^(\d+)x ?(.+)/

var tmplRecipe;
var tmplDependency;

var promises = [];

promises.push($.get("templates/dependency.html").done((data) => {
    tmplDependency = doT.template(data.trim());
}));

promises.push($.get("templates/recipe.html").done((data) => {
    tmplRecipe = doT.template(data.trim());
}));

$.when.apply($, promises).then(function() {
    test();
    refresh();
});

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
}

function parseItemString(item) {
    count = 1;
    if (countMatch.test(item)) {
        var match = countMatch.exec(item);
        count = parseInt(match[1]);
        item = match[2];
    }
    return {count: count, item: item};

}

function refresh(focus) {
    $('.recipes').empty();
    $.each(recipes, (key, value) => {
        if (value != undefined) $('.recipes').append(tmplRecipe(value));
    });
    $('.needs-form').submit(function(event) {
        var string = $(this).children('.needs-input').val();
        var item = $(this).parent().attr('itemname');
        var id = $(this).parent().attr('id');
        if (string == '') {
            recipes[item].needs.pop();
            event.preventDefault();
            refresh('#' + id);
            return;
        }
        var needs = parseItemString(string);
        addDependency(item, needs.item, needs.count);
        refresh('#' + id);
        event.preventDefault();
    });
    if (focus != undefined) {
        console.log(focus);
        $(focus).find('.needs-input').focus();
    }
}

function addRecipe(item, count) {
    recipes[item] = {
        makes: item,
        count: count,
        needs: [],
        slug: slugify(item)
    };
    recipesAdded.push(item);
    refresh();
}

function popRecipe() {
    recipes[recipesAdded[recipesAdded.length - 1]] = undefined;
    recipesAdded.pop();
    refresh();
}

function addDependency(item, dependency, count) {
    recipes[item].needs.push({name: dependency, count: count, slug: slugify(dependency)});
}

$('.recipe-add').keyup(function() {
    if ($('.recipe-add').val() != '' || $('.recipe').length == 0) {
        $('.recipe-submit').html('<i class="fas fa-plus"></i>');
    } else {
        $('.recipe-submit').html('<i class="fas fa-check"></i>');
    }
});

$('.recipe-form').submit(function(event) {
    var item = $('.recipe-add').val().trim();
    if (item == '') {
        popRecipe();
    } else {
        var i = parseItemString(item);
        addRecipe(i.item, i.count);
    }

    $('.recipe-add').val('');
    event.preventDefault();
});

function test() {
    addRecipe("piston", 1);
    addDependency("piston", "iron", 1);
    addDependency("piston", "redstone", 1);
    addDependency("piston", "stone", 4);
    addDependency("piston", "plank", 3);
}
