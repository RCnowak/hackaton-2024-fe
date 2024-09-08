<?PHP
if(!empty($_FILES['thumbnail']))
{
  $path = __DIR__."/../uploads/";
  $filename = time().'_'.basename( $_FILES['thumbnail']['name']);
  $path = $path . $filename;

  if(move_uploaded_file($_FILES['thumbnail']['tmp_name'], $path)) {
    echo "/uploads/".  basename( $_FILES['uploaded_file']['name']);
  } else{
    echo "There was an error uploading the file, please try again!";
  }
}
?>
