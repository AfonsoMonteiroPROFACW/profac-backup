# Arquivo grande do backup

O arquivo original zipFile.zip foi dividido porque a API de arquivos do GitHub não aceita esse tamanho em uma única operação.

- Tamanho original: 82205938 bytes
- SHA-256: 9362cdcb5d55e4356f1f5efe10ada14d388b67f79cc19ce99aee53e7bcd98074
- Partes: 79
- Tamanho de cada parte: 1 MiB (exceto a última)

## Remontagem

Na raiz do repositório, execute:

cat backup-large-files/zipFile.zip.part-* > zipFile.zip
sha256sum zipFile.zip

O hash esperado é 9362cdcb5d55e4356f1f5efe10ada14d388b67f79cc19ce99aee53e7bcd98074.
