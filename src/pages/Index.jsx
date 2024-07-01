import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const fetchTopStories = async () => {
  const response = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json"
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const storyIds = await response.json();
  const top100Ids = storyIds.slice(0, 100);
  const storyPromises = top100Ids.map(async (id) => {
    const storyResponse = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json`
    );
    if (!storyResponse.ok) {
      throw new Error("Network response was not ok");
    }
    return storyResponse.json();
  });
  return Promise.all(storyPromises);
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, error, isLoading } = useQuery({
    queryKey: ["topStories"],
    queryFn: fetchTopStories,
  });

  const filteredStories = data?.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Hacker News Top 100 Stories</h1>
      <Input
        type="text"
        placeholder="Search stories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      {isLoading && (
        <div className="grid gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      )}
      {error && (
        <Alert>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error fetching the top stories.
          </AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4">
        {filteredStories?.map((story) => (
          <Card key={story.id}>
            <CardHeader>
              <CardTitle>{story.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Upvotes: {story.score}</p>
              <a
                href={`https://news.ycombinator.com/item?id=${story.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Read more
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;