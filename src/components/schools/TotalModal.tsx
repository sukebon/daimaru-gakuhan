import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { NextPage } from 'next';
import React from 'react';

type Props = {
  totals: string[];
  totalPrice: number;
};

const TotalModal: NextPage<Props> = ({ totals, totalPrice }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Flex justifyContent='flex-end'>
        <Button size='sm' colorScheme='facebook' onClick={onOpen}>
          集計
        </Button>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} size='xs'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>集計</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {totalPrice && (
              <>
                <Box>合計金額 {Math.round(totalPrice)?.toLocaleString()}円</Box>
                <Box>{`（税込み${Math.round(
                  totalPrice
                ).toLocaleString()}円）`}</Box>
              </>
            )}

            {totals?.map((total: any, index: number) => (
              <Box mt={6} key={index}>
                {total.map(
                  (
                    value: {
                      productName: string;
                      size: string;
                      quantity: number;
                      sum: number;
                    },
                    index: number,
                    array: []
                  ) => (
                    <Box key={index}>
                      {index === 0 && (
                        <Box fontWeight='bold'>{value.productName} </Box>
                      )}
                      <Flex mt={1}>
                        <Box w={12}>{value.size}</Box>
                        <Box w={10} textAlign='right'>
                          {value.quantity}
                        </Box>
                      </Flex>
                      {index === array.length - 1 && (
                        <Flex
                          mt={1}
                          py={1}
                          borderTop='1px'
                          borderColor='gray.200'
                        >
                          <Box w={12}>合計</Box>
                          <Box w={10} textAlign='right'>
                            {value.sum}
                          </Box>
                        </Flex>
                      )}
                    </Box>
                  )
                )}
              </Box>
            ))}
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TotalModal;
