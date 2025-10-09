<?php

namespace App\Services;

use ImageKit\ImageKit;

class ImageKitService
{
  protected ImageKit $imageKit;

  public function __construct()
  {
    $this->imageKit = new ImageKit(
      config('services.imagekit.public_key'),
      config('services.imagekit.private_key'),
      config('services.imagekit.url_endpoint')
    );
  }

  public function upload($file)
  {
    $upload = $this->imageKit->uploadFile([
      'file' => base64_encode(file_get_contents($file->getRealPath())),
      'fileName' => uniqid() . '_' . $file->getClientOriginalName(),
    ]);

    return $upload->result->url ?? null;
  }

  public function delete($fileId)
  {
    return $this->imageKit->deleteFile($fileId);
  }
}
