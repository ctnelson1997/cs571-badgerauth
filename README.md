
build
```bash
docker build . -t ctnelson1997/cs571-badgerauth
docker push ctnelson1997/cs571-badgerauth
```

run
```bash
docker pull ctnelson1997/cs571-badgerauth
docker run --name=cs571_badgerauth -d --restart=always -p 37199:37199 -v /cs571/badgerauth:/cs571 ctnelson1997/cs571-badgerauth
```