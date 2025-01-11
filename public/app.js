const capture = async () => {
  const capture = new CaptureUI();
  await capture.initialize();
  console.log(capture);
  
};

capture();