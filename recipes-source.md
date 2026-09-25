# Recipes

Source data for the recipe app. Claude Code CLI should parse this file into
`recipes.json`. Each recipe is a level-2 heading; `id` is derived from the
heading by lowercasing and hyphenating (spaces → hyphens, no punctuation).
Ingredients are a plain bullet list, one ingredient per line, written
exactly as they should appear in the app — reuse the exact same wording for
the same ingredient across recipes (e.g. always "onion", never "onion" in
one recipe and "yellow onion" in another) so the deduplicated ingredient
list doesn't fragment into near-duplicates. Exceptions for deduplication are
evidently different products such as cucumbers and pickles.

## Cepti kartupeļi ar cīsiņiem

- kartupeļi
- cīsiņi
- sīpoli

## Vārīti kartupeļi ar cīsiņiem un štovētiem kāpostiem

- kartupeļi
- cīsiņi
- štovēti kāposti

## Vārīti kartupeļi ar maltās gaļas mērci

- kartupeļi
- maltā gaļa
- sīpoli
- piens
- milti

## Griķi ar maltās gaļas mērci

- griķi
- maltā gaļa
- sīpoli
- piens
- milti

## Makaroni ar maltās gaļas mērci

- makaroni
- maltā gaļa
- sīpoli
- piens
- milti

## Makaroni ar malto gaļu un sieru

- makaroni
- maltā gaļa
- siers

## Rīsi ar vistu

- rīsi
- vistas fileja
- sīpoli
- teriyaki mērce
- sojas mērce

## Gurķu un tomātu salāti

- gurķi
- tomāti
- loki
- dilles

## Frikadeļu zupa

- kartupeļi
- burkāni
- sīpoli
- maltā gaļa
- buljona kubiki

## Tortiljas ar vistu

- vistas fileja
- tortiljas
- tomāti
- sīpoli
- paprika

## Vistas stir-fry

- vistas fileja
- paprika
- sīpoli
- burkāni
- cukini

## Biešu zupa

- kartupeļi
- burkāni
- bietes
- liellopa gaļa
- buljona kubiki

## Aukstā zupa

- bietes
- kefīrs
- gurķi
- loki
- dilles

## Soļanka

- kartupeļi
- burkāni
- sīpoli
- cīsiņi
- žāvēta gaļa
- tomātu pasta
- buljona kubiki
- marinēti gurķi

## Pupiņu zupa

- sīpoli
- cīsiņi
- tomāti
- pupiņas
- kartupeļi
- burkāni
- buljona kubiki