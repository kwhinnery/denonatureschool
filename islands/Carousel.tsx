import { useSignal } from "@preact/signals";

const IMAGES = [
  "/dino1.jpeg",
  "/dino2.jpeg",
  "/dino3.jpeg",
];

function CarouselButton(props: any) {
  return (
    <button class="p-4 m-1" {...props}>
      {props.children}
    </button>
  );
}

export default function Carousel() {
  const imageIndex = useSignal(0);

  return (
    <section class="
      flex flex-col justify-center items-center
      py-8
    ">
      <div>
        <img src={IMAGES[imageIndex.value]} />
      </div>
      <p>
        <CarouselButton
          onClick={() => {
            if (imageIndex.value > 0) {
              imageIndex.value--;
            } else {
              imageIndex.value = IMAGES.length - 1;
            }
          }}
        >
          Previous
        </CarouselButton>
        <CarouselButton
          onClick={() => {
            if (imageIndex.value < IMAGES.length - 1) {
              imageIndex.value++;
            } else {
              imageIndex.value = 0;
            }
          }}
        >
          Next
        </CarouselButton>
      </p>
    </section>
  );
}
