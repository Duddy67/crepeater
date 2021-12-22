<?php

$data = [
  ['editor' => 'Gallimard', 'standard' => 'isbn', 'translations' => ['french', 'english'], 'version' => 'integral', 'ebook' => 1],
  ['editor' => 'Grasset', 'standard' => 'apa', 'translations' => ['french', 'english', 'russian', 'italian'], 'version' => 'redacted', 'ebook' => 0],
  ['editor' => 'Flammarion', 'standard' => 'istc', 'translations' => ['chinese', 'english'], 'version' => 'integral', 'ebook' => 1],
  ['editor' => 'Hachette', 'standard' => 'isni', 'translations' => ['japanese', 'italian'], 'version' => 'redacted', 'ebook' => 0],
  ['editor' => 'France Loisirs', 'standard' => 'isbn', 'translations' => ['german', 'spanish'], 'version' => 'integral', 'ebook' => 1],
];

$response = ['success' => true, 'message' => '', 'data' => $data];

echo json_encode($response);

