/* eslint-disable no-undef */
const recipes = {};

const recipesAdded = [];

const countMatch = /^(\d+)x ?(.+)/u;

let tmplRecipe;

const promises = [];

promises.push($.get("templates/recipe.html").done((data) => {
    tmplRecipe = doT.template(data.trim());
}));

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/ug, '')
        .replace(/ +/ug, '-');
}

function parseItemString(item) {
    count = 1;
    if (countMatch.test(item)) {
        const match = countMatch.exec(item);
        count = parseInt(match[1], 10);
        item = match[2];
    }
    return { count: count, item: item };

}

function hasRecipe(recipe) {
    return recipes.hasOwnProperty(recipe) && recipes[recipe] !== undefined;
}

function mergeCounts(base, dep) {
    $.each(dep, (key, value) => {
        base[key] = base.hasOwnProperty(key) ? base[key] + value : value;
    });
}

function hasDependencyChain(recipe) {
    return recipe.needs.some((dep) => {
        return hasRecipe(dep.name);
    });
}

function getBaseItemCounts(recipe, count) {
    const counts = {};
    if (hasRecipe(recipe)) {
        const actuallyNeeds = Math.ceil(count / recipes[recipe].count);
        $.each(recipes[recipe].needs, function(index, dep) {
            const depCounts = getBaseItemCounts(dep.name, actuallyNeeds * dep.count);
            mergeCounts(counts, depCounts);
        });
    } else {
        counts[recipe] = count;
    }
    return counts;
}

function addDependency(item, dependency, count) {
    recipes[item].needs.push({ name: dependency, count: count, slug: slugify(dependency) });
}

function refresh(focus) {
    $('.recipes').empty();
    $.each(recipes, (key, value) => {
        if (value !== undefined) $('.recipes').append(tmplRecipe(value));
    });
    $('.needs-form').submit(function(event) {
        const string = $(this).children('.needs-input').val();
        const item = $(this).parent().attr('itemname');
        const id = $(this).parent().attr('id');
        if (string === '') {
            recipes[item].needs.pop();
            event.preventDefault();
            refresh('#' + id);
            return;
        }
        const needs = parseItemString(string);
        addDependency(item, needs.item, needs.count);
        refresh('#' + id);
        event.preventDefault();
    });
    if (focus !== undefined) {
        $(focus).find('.needs-input')
            .focus();
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

$('.recipe-add').keyup(() => {
    if ($('.recipe-add').val() !== '' || $('.recipe').length === 0) {
        $('.recipe-submit').html('<i class="fas fa-plus"></i>');
    } else {
        $('.recipe-submit').html('<i class="fas fa-check"></i>');
    }
});

$('.recipe-form').submit((event) => {
    const item = $('.recipe-add').val()
        .trim();
    if (item === '') {
        popRecipe();
    } else {
        const i = parseItemString(item);
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

    addRecipe("plank", 4);
    addDependency("plank", "log", 1);

    addRecipe("stone", 1);
    addDependency("stone", "cobblestone", 1);
    refresh();
}

$.when.apply($, promises).then(function() {
    // test();
    refresh();
});

